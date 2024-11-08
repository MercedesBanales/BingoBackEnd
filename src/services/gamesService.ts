import * as gamesRepository from '../dataAccess/repositories/gamesRepository';

export const start = async (player_ids: number[]) => {
    return await gamesRepository.create(player_ids);
}