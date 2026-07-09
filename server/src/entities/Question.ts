import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Exam } from './Exam';

export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    SHORT_ANSWER = 'short_answer',
    TRUE_FALSE = 'true_false',
}

@Entity('questions')
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Exam, (exam) => exam.questions, { onDelete: 'CASCADE' })
    exam: Exam;

    @Column({ type: 'text' })
    text: string;

    @Column({ type: 'varchar', default: QuestionType.SHORT_ANSWER })
    type: QuestionType;

    @Column({ type: 'simple-json', nullable: true })
    options: string[]; // for multiple choice

    @Column({ type: 'text', nullable: true })
    correctAnswer: string;

    @Column({ type: 'int', default: 1 })
    points: number;
}
