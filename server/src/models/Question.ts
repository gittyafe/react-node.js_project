import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  examId: mongoose.Types.ObjectId;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
  createdAt: Date;
}

const QuestionSchema: Schema = new Schema(
  {
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    questionText: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, required: true },
    points: { type: Number, default: 1 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const QuestionModel = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
export default QuestionModel;
