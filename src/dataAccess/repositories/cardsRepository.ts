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

export const create = async (player_id: string, game_id: string): Promise<CardDTO> => {
    const card = generateCard();
    const new_card = new Card({ playerId: player_id, gameId: game_id, card });
    await new_card.save();
    return {player_id, game_id, card };
}

const generateCard = (): number[][] => {
    const numbers = Array.from({ length: parseInt(process.env.MAX_CARD_NUMBER!) }, (_, i) => i + 1);

    // Shuffle the numbers using Fisher-Yates algorithm
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    const card: number[][] = [];
    let counter = 0;

    for (let row = 0; row < parseInt(process.env.MAX_ROW_LENGTH!); row++) {
        const rowValues: (number)[] = [];
        for (let col = 0; col < parseInt(process.env.MAX_COL_LENGTH!); col++) {
            if (row === 2 && col === 2) {
                rowValues.push(0); // Center space is free
            } else {
                rowValues.push(numbers[counter]);
                counter++;
            }
        }
        card.push(rowValues);
    }

    return card;
};
