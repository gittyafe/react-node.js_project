import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { UserRole } from './user-role.enum'; // יבוא של ה-Enum המרכזי

@Entity('users') 
export class User {
  // workaround TypeORM decorator signature resolution
  // @ts-ignore
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', unique: true }) 
  email: string;

  @Column({ type: 'varchar' }) 
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT, // שימוש ב-Enum המיובא
  })
  role: UserRole;

  @CreateDateColumn() 
  createdAt: Date;
}