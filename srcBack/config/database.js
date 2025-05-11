import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.NAME || 'gestion_des_incidents',
  process.env.USER || 'root',
  process.env.PASSWORD || '',
  {
    host: process.env.HOST || 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging: false,
    timezone: '+00:00'
  }
);

export default sequelize;