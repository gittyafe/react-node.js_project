import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Exam } from './Exam';

@Entity('results')
export class Result {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Exam, { onDelete: 'SET NULL' })
    exam: Exam;

    @Column({ type: 'varchar', nullable: true })
    userId: string;

    @Column({ type: 'simple-json' })
    answers: { questionId: string; answer: any }[];

    @Column({ type: 'int', default: 0 })
    score: number;

    @CreateDateColumn()
    submittedAt: Date;
}
