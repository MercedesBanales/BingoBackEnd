import { GameDTO } from '../../utils/DTOs/gameDTO';
import { Game } from '../models/Game';
import { sequelize } from '../../config/mysql_db';
import { User } from '../models/User';

export const create = async (dto: GameDTO): Promise<string> => {
    const game = await Game.create({ winner: dto.winner, status: dto.status });
    const playerInstances = await User.findAll({
        where: { id: dto.players.map(player => player.id) }
    });
    playerInstances.forEach(player => sequelize.models.GameUser.create({
        UserId: player.getDataValue("id"), 
        GameId: game.getDataValue("id")
    }));
    return game.getDataValue("id");
}
