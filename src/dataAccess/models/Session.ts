import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/mysql_db";

export class Session extends Model {}

Session.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    token: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: true,
        unique: true
    },
}, {
    sequelize,
    tableName: 'Session',
    timestamps: false,
})
