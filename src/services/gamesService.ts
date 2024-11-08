import * as gamesRepository from '../dataAccess/repositories/gamesRepository';
import * as cardsService from './cardsService';
import { PlayResponse } from '../utils/interfaces/PlayResponse';
import { CardDTO } from '../utils/DTOs/cardDTO';

const WIN_MESSAGE: string = "You won!";
const PLAY_MESSAGE: string = "Keep playing";

export const start = async (player_ids: string[]) => {
    await gamesRepository.create(player_ids);
}

export const play = async (player_id: string, game_id: string, coord_x: number, coord_y: number) : Promise<PlayResponse | null>=> {
    const { updated_card, win } = await cardsService.setChosenNumber(player_id, game_id, coord_x, coord_y); 
    if (win) return notifyWin(game_id, player_id, updated_card);
    return { card: updated_card, message: PLAY_MESSAGE};
}

export const notifyWin = async (game_id: string, winner_id: string, card: CardDTO) : Promise<PlayResponse> => {
    await gamesRepository.update(game_id, winner_id);
    return { card, message: WIN_MESSAGE };
}

