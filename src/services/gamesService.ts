import * as gamesRepository from '../dataAccess/repositories/gamesRepository';
import * as cardsService from './cardsService';
import { PlayResponse } from '../utils/interfaces/PlayResponse';
import { CardDTO } from '../utils/DTOs/cardDTO';

const WIN_MESSAGE: string = "You won!";
const PLAY_MESSAGE: string = "Keep playing";
const DISQUALIFIED_MESSAGE: string = "You are disqualified";

export const start = async (player_ids: string[]) : Promise<CardDTO[]>=> {
    const game_id = await gamesRepository.create(player_ids);
    const cards: CardDTO[] = [];
    player_ids.forEach(async player_id => {
        const card = await cardsService.create(player_id, game_id);
        cards.push(card);
    });
    return cards;
}

export const play = async (player_id: string, game_id: string, coord_x: number, coord_y: number) : Promise<PlayResponse | null>=> {
    const  updated_card = await cardsService.setChosenNumber(player_id, game_id, coord_x, coord_y); 
    return { card: updated_card, message: PLAY_MESSAGE};
}

export const bingo = async (player_id: string, game_id: string) : Promise<PlayResponse> => {
    const card = await cardsService.find(player_id, game_id);
    const win = cardsService.checkWin(card);
    if (win) return notifyWin(card);
    return { card, message: DISQUALIFIED_MESSAGE };
}

export const notifyWin = async (card: CardDTO) : Promise<PlayResponse> => {
    await gamesRepository.update(card.game_id, card.player_id);
    return { card, message: WIN_MESSAGE };
}

