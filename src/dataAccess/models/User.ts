import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";
import { Session } from "./Session";

export class User extends Model {}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'User',
    timestamps: false,
})
User.hasOne(Session);