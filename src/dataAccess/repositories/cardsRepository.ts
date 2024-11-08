import { Card } from '../schemas/cardSchema';
import { CardDTO } from '../../utils/DTOs/cardDTO';
import { NotFoundException } from '../../validators/exceptions/notFoundException';

export const find = async (criteria: { [key: string]: any }): Promise<CardDTO> => {
    const card = await Card.findOne(criteria);
    if (!card) throw new NotFoundException('Card not found');
    const cardMatrix: number[][] = card.card.map((row: any) => row.toObject().map((col: any) => col));
    return {
        id: card.id,
        player_id: card.playerId,
        game_id: card.gameId,
        card: cardMatrix
    }
}

export const update = async (player_id: string, game_id: string, coord_x: number, coord_y: number): Promise<CardDTO> => {
    await Card.updateOne(
        { playerId: player_id, gameId: game_id }, 
        { $set: { [`card.${coord_x}.${coord_y}`]: 0 } }
    );
    return await find({ playerId: player_id, gameId: game_id }); 
}

export const create = async (dto: CardDTO): Promise<string> => {
    const new_card = new Card({ playerId: dto.player_id, gameId: dto.game_id, card: dto.card });
    await new_card.save();
    return new_card._id.toString();
}