import mongoose, { Schema, Document } from 'mongoose';

export type ExamDifficulty = 'easy' | 'medium' | 'hard';

export interface IExam extends Document {
  title: string;
  subject: string;
  difficulty: ExamDifficulty;
  description?: string;
  duration: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ExamSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', trim: true },
    description: { type: String, trim: true },
    duration: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const ExamModel = mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);
export default ExamModel;
