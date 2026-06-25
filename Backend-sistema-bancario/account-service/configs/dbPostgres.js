import { fileURLToPath } from 'url';
import path from 'path';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  logging: false,
  define: {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const dbPostgresConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Account Service | PostgreSQL connected');
  } catch (error) {
    console.error('Account Service | PostgreSQL connection error:', error.message);
  }
};

export default sequelize;
