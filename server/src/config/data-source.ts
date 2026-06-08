import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/users/User'; // ודאי שהנתיב תואם למיקום הקובץ שיצרנו קודם

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432, // פורט ברירת המחדל של PostgreSQL
  username: 'postgres', // שם המשתמש שלך ב-DB
  password: 'your_password', // הסיסמה שהגדרת בהתקנת ה-DB
  database: 'exam_system_db', // שם ה-Database שיצרת
  synchronize: true, // יוצר את הטבלאות אוטומטית לפי המודלים (מומלץ רק בסביבת פיתוח!)
  logging: false,
  entities: [User], // כאן נרשום את כל המודלים שניצור
  migrations: [],
  subscribers: [],
});