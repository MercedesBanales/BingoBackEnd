import * as cardsRepository from '../dataAccess/repositories/cardsRepository';
import { CardDTO } from '../utils/DTOs/cardDTO';
import * as gameHandler from '../handlers/gameHandler';
import { InvalidNumberException } from '../validators/exceptions/invalidNumberException';

const bingo_dictionary: { [key: number]: string } = {
    0: 'B',
    1: 'I',
    2: 'N',
    3: 'G',
    4: 'O'
}

export const setChosenNumber = async (player_id: string, game_id: string, coord_x: number, coord_y: number) => {
    const find = await cardsRepository.find({ playerId: player_id, gameId: game_id });
    const sequence = gameHandler.getSequence(game_id);
    if (!sequence.includes(`${bingo_dictionary[coord_y]}${find.card[coord_x][coord_y]}`)) throw new InvalidNumberException('Number not in sequence');
    return await cardsRepository.update(player_id, game_id, coord_x, coord_y); 
}

export const create = async (player_id: string, game_id: string): Promise<CardDTO> => {
    return await cardsRepository.create(player_id, game_id);
}

export const find = async (player_id: string, game_id: string): Promise<CardDTO> => {
    return await cardsRepository.find({ playerId: player_id, gameId: game_id });
}

export const checkWin = (card: CardDTO): boolean => {
    return checkFull(card.card) 
    || checkRows(card.card) 
    || checkColumns(card.card) 
    || checkDiagonals(card.card) 
    || checkEdges(card.card)
}

export const checkRows = (card: number[][]): boolean => {
    return card.some(row => row.every(cell => cell === 0));
}

export const checkColumns = (card: number[][]): boolean => {
    return card[0].some((_, i) => card.every(row => row[i] === 0));
}

export const checkDiagonals = (card: number[][]): boolean => {
    const mainDiagonal = card.every((row, i) => row[i] === 0);
    const secondaryDiagonal = card.every((row, i) => row[card.length - 1 - i] === 0);
    return mainDiagonal || secondaryDiagonal;  
}

export const checkEdges = (card: number[][]): boolean => {
    return card[0][0] === 0 
    && card[0][card.length - 1] === 0 
    && card[card.length - 1][0] === 0 
    && card[card.length - 1][card.length - 1] === 0;
}

export const checkFull = (card: number[][]): boolean => {
    return card.every(row => row.every(cell => cell === 0));
}
