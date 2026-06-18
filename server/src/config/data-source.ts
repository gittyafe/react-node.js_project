import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/users/User'; // ודאי שהנתיב תואם למיקום הקובץ שיצרנו קודם
import dotenv from 'dotenv';

// טעינת משתני הסביבה מקובץ ה-.env שבחוץ
dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USER = 'postgres',
  DB_PASSWORD = '1234',
  DB_NAME = 'SmartTest',
} = process.env;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true, // יוצר את הטבלאות אוטומטית לפי המודלים (מומלץ רק בסביבת פיתוח!)
  logging: false,
  entities: [User], // כאן נרשום את כל המודלים שניצור
  migrations: [],
  subscribers: [],
});