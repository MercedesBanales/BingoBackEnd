import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/mysql_db";
import { User } from "./User";

export class Game extends Model {}

Game.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    winner: {
        type: DataTypes.UUID,
        allowNull: true,
    }
}, {
    sequelize,
    tableName: 'Game',
    timestamps: false,
})

Game.belongsToMany(User, { through: 'GameUser', foreignKey: 'GameId', otherKey: 'UserId', timestamps: false });


