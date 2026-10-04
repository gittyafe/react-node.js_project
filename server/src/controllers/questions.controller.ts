import { Request, Response } from 'express';
import QuestionModel from '../models/Question';
import logger from '../config/logger';
import { UserRole } from '../entities/users/user-role.enum';

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { examId } = req.query as any;
    const filter: any = {};
    if (examId) filter.examId = examId;
    const questions = await QuestionModel.find(filter).exec();
    // If requester is teacher or admin, include correctAnswer; otherwise, strip it
    const role = req.user?.role as UserRole | undefined;
    const reveal = role === UserRole.TEACHER || role === UserRole.ADMIN;

    const safe = questions.map((q) => {
      const obj: any = {
        _id: q._id,
        examId: q.examId,
        questionText: q.questionText,
        options: q.options,
        points: q.points,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };
      if (reveal) obj.correctAnswer = q.correctAnswer;
      return obj;
    });

    return res.status(200).json(safe);
  } catch (err) {
    logger.error('Failed to get questions', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const q = await QuestionModel.create(req.body);
    return res.status(201).json(q);
  } catch (err) {
    logger.error('Failed to create question', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const q = await QuestionModel.findByIdAndUpdate(id, req.body, { new: true }).exec();
    if (!q) return res.status(404).json({ message: 'Question not found' });
    return res.status(200).json(q);
  } catch (err) {
    logger.error('Failed to update question', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await QuestionModel.findByIdAndDelete(id).exec();
    return res.status(204).send();
  } catch (err) {
    logger.error('Failed to delete question', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default { getQuestions, createQuestion, updateQuestion, deleteQuestion };
