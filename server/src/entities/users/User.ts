import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// הגדרת סוגי ההרשאות (Enum) כדי למנוע שגיאות כתיב בהמשך
export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Entity('users') // כך תקרא הטבלה ב-PostgreSQL
export class User {
  @PrimaryGeneratedColumn('uuid') // ייצר מזהה ייחודי אוטומטי (מחרוזת ארוכה)
  id: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', unique: true }) // ה-unique מוודא שלא יירשמו שני משתמשים עם אותו אימייל
  email: string;

  @Column({ type: 'varchar' }) // הסיסמה שתישמר כאן חייבת להיות מוצפנת!
  password: string;

  @Column({
    type: 'varchar',
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @CreateDateColumn() // פיצ'ר נחמד ששומר אוטומטית את תאריך ההרשמה
  createdAt: Date;
}