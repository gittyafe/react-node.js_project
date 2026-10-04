import mongoose, { Schema, Document } from 'mongoose';

export interface IResult extends Document {
  studentId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  score: number;
  submittedAt: Date;
}

const ResultSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    score: { type: Number, required: true },
  },
  { timestamps: { createdAt: 'submittedAt' } }
);

const ResultModel = mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);
export default ResultModel;
