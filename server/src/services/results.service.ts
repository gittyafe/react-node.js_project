import mongoose from 'mongoose';
import QuestionModel from '../models/Question';
import ResultModel from '../models/Result';

export interface SubmitResultPayload {
  studentId?: string;
  examId?: string;
  answers: Array<{ questionId: string; answer: any }>;
}

export const submitResultService = async (payload: SubmitResultPayload) => {
  const { studentId, examId, answers } = payload;

  const questionIds = answers.map((a) => new mongoose.Types.ObjectId(a.questionId));
  const questions = await QuestionModel.find({ _id: { $in: questionIds } }).exec();

  let score = 0;
  for (const q of questions) {
    const ans = answers.find((a) => a.questionId === q._id.toString() || a.questionId == q._id);
    if (!ans) continue;
    if (String(ans.answer).trim() === String(q.correctAnswer).trim()) {
      score += q.points || 1;
    }
  }

  const resultPayload: any = { score };
  if (studentId) resultPayload.studentId = new mongoose.Types.ObjectId(studentId);
  if (examId) resultPayload.examId = new mongoose.Types.ObjectId(examId);

  const result = await ResultModel.create(resultPayload);
  return result;
};

export const getResults = async (filter: any) => {
  return ResultModel.find(filter).exec();
};

export default { submitResultService, getResults };