import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/users/User';
import { Exam } from '../entities/Exam';
import { Question } from '../entities/Question';
import { Result } from '../entities/Result';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USER = 'postgres',
  DB_PASSWORD = '1234',
  DB_NAME = 'SmartTest',
  DB_TYPE = 'sqljs',
  SQLITE_DB_PATH = 'smarttest.sqlite',
} = process.env;

const postgresDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Exam, Question, Result],
  migrations: [],
  subscribers: [],
});

const sqliteDataSource = new DataSource({
  type: 'sqljs',
  autoSave: true,
  location: SQLITE_DB_PATH,
  synchronize: true,
  logging: false,
  entities: [User, Exam, Question, Result],
  migrations: [],
  subscribers: [],
});

export let AppDataSource: DataSource = DB_TYPE === 'postgres' ? postgresDataSource : sqliteDataSource;

export async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log(`✅ Data Source has been initialized using ${AppDataSource.options.type}`);
    return AppDataSource;
  } catch (err) {
    if (AppDataSource.options.type !== 'sqljs') {
      console.warn('⚠️ PostgreSQL is not available, falling back to SQLite for local development.');
      AppDataSource = sqliteDataSource;
      await AppDataSource.initialize();
      console.log(`✅ Fallback Data Source has been initialized using ${AppDataSource.options.type}`);
      return AppDataSource;
    }

    throw err;
  }
}