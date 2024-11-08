import { GameDTO } from '../../utils/DTOs/gameDTO';
import { Game } from '../models/Game';
import { sequelize } from '../../config/mysql_db';
import { User } from '../models/User';

const INITIAL_GAME_STATUS = "in_progress";

export const create = async (player_ids: number[]): Promise<string> => {
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
