import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

export const sequelize: Sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: 'mysql',
  host: 'localhost',
  port: parseInt(process.env.DB_PORT!),
});

export const dbSync = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database synced');
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
}



