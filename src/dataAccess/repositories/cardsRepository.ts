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
    const maxCardNumber = parseInt(process.env.MAX_CARD_NUMBER!);
    const numRows = parseInt(process.env.MAX_ROW_LENGTH!);
    const numCols = parseInt(process.env.MAX_COL_LENGTH!);

    const rangeSize = Math.floor(maxCardNumber / numCols); // Size of each column's range

    const card: number[][] = Array.from({ length: numRows }, () => []);

    for (let colIndex = 0; colIndex < numCols; colIndex++) {
        const min = colIndex * rangeSize + 1;
        const max = (colIndex === numCols - 1) ? maxCardNumber : min + rangeSize - 1;

        const columnNumbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

        // Shuffle the numbers in the column using Fisher-Yates algorithm
        for (let i = columnNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [columnNumbers[i], columnNumbers[j]] = [columnNumbers[j], columnNumbers[i]];
        }

        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
            if (rowIndex === 2 && colIndex === 2) {
                card[rowIndex][colIndex] = 0; // Center space is free
            } else {
                card[rowIndex][colIndex] = columnNumbers.pop()!;
            }
        }
    }
    return card;
};


