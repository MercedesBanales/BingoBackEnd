import { Card } from '../schemas/cardSchema';
import { CardDTO } from '../../utils/DTOs/CardDTO';

export const find = async (criteria: { [key: string]: any }): Promise<CardDTO | null> => {
    const card = await Card.findOne(criteria);
    if (!card) return null;
    const cardMatrix: number[][] = card.card.map((row: any) => row.toObject().map((col: any) => col));
    return {
        id: card.id,
        player_id: card.playerId,
        game_id: card.gameId,
        card: cardMatrix
    }
}

export const update = async (card_id: string, coord_x: number, coord_y: number): Promise<void> => {
}