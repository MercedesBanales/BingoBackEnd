import { GameDTO } from '../../utils/DTOs/gameDTO';
import { Game } from '../models/Game';
import { sequelize } from '../../config/mysql_db';
import { User } from '../models/User';
import { NotFoundException } from '../../validators/exceptions/notFoundException';
import * as usersRepository from './usersRepository';

const INITIAL_GAME_STATUS = "in_progress";
const FINAL_GAME_STATUS = "finished";

export const create = async (player_ids: string[]): Promise<string> => {
    const game = await Game.create({ winner: null, status: INITIAL_GAME_STATUS });
    const playerInstances = await User.findAll({
        where: { id: player_ids.map(player_id => player_id) }
    });
    playerInstances.forEach(player => sequelize.models.GameUser.create({
        UserId: player.getDataValue("id"), 
        GameId: game.getDataValue("id")
    }));
    return game.getDataValue("id");
}

export const update = async (game_id: string, winner_id: string): Promise<GameDTO> => {
    await Game.update({ winner: winner_id, status: FINAL_GAME_STATUS}, { where: { id: game_id } });
    return await find({ where: { id: game_id } });
}

export const find = async (criteria: { where: { [key: string]: any } }): Promise<GameDTO> => {
    const game = await Game.findOne(criteria);
    if (!game) throw new NotFoundException('Game not found');
    const game_players = await sequelize.models.GameUser.findAll({ where: { GameId: game.getDataValue("id") } });
    return {
        id: game.getDataValue("id"),
        winner: game.getDataValue("winner"),
        status: game.getDataValue("status"),
        players: game_players.map(game_player => game_player.getDataValue("UserId"))
    } as GameDTO
};
