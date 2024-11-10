import * as gamesRepository from '../dataAccess/repositories/gamesRepository';
import * as cardsService from './cardsService';
import { PlayResponse } from '../utils/interfaces/PlayResponse';
import { CardDTO } from '../utils/DTOs/cardDTO';
import { UserDTO } from '../utils/DTOs/userDTO';

export enum StatusType {
    WIN= 'WIN',
    DISQUALIFIED= 'DISQUALIFIED',
    PLAY= 'PLAY '
}

export const start = async (player_ids: string[]) : Promise<string>=> {
    const game_id = await gamesRepository.create(player_ids);
    const cards: CardDTO[] = [];
    player_ids.forEach(async player_id => {
        const card = await cardsService.create(player_id, game_id);
        cards.push(card);
    });
    return game_id;
}

export const play = async (player_id: string, game_id: string, coord_x: number, coord_y: number) : Promise<PlayResponse>=> {
    const  updated_card = await cardsService.setChosenNumber(player_id, game_id, coord_x, coord_y); 
    return { card: updated_card.card, message: StatusType.PLAY};
}

export const bingo = async (player_id: string, game_id: string) : Promise<PlayResponse> => {
    const card = await cardsService.find(player_id, game_id);
    const win = cardsService.checkWin(card);
    if (win) return notifyWin(card);
    return { card: card.card, message: StatusType.DISQUALIFIED };
}

export const notifyWin = async (card: CardDTO) : Promise<PlayResponse> => {
    await gamesRepository.update(card.game_id, card.player_id);
    return { card: card.card, message: StatusType.WIN };
}

export const getCard = async (player_id: string, game_id: string) : Promise<CardDTO> => {
    return await cardsService.find(player_id, game_id);
}

export const getPlayers = async (game_id: string) : Promise<UserDTO[]> => {
    return await gamesRepository.findMany({where: { GameId: game_id }});
}


