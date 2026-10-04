import { Request, Response } from 'express';
import ExamModel from '../models/Exam';
import logger from '../config/logger';

const normalizeSubject = (value: unknown) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || 'General';
};

export const getAllExams = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const search = (req.query.search as string) || '';
    const subjectFilter = (req.query.subject as string)?.trim();
    const difficultyFilter = ((req.query.difficulty as string) || '').trim().toLowerCase();

    const filter: any = {};

    if (subjectFilter) {
      filter.subject = { $regex: new RegExp(subjectFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
    }

    if (difficultyFilter && ['easy', 'medium', 'hard'].includes(difficultyFilter)) {
      filter.difficulty = difficultyFilter;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
        { subject: { $regex: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
      ];
    }

    const total = await ExamModel.countDocuments(filter).exec();
    const exams = await ExamModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();

    return res.status(200).json({ value: exams, Count: total });
  } catch (err) {
    logger.error('Failed to get exams', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getExamById = async (req: Request, res: Response) => {
  try {
    const exam = await ExamModel.findById(req.params.id).exec();

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    return res.status(200).json(exam);
  } catch (err) {
    logger.error('Failed to get exam by id', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createExam = async (req: Request, res: Response) => {
  try {
    const title = String(req.body.title ?? '').trim();
    const subject = normalizeSubject(req.body.subject);
    const duration = Number(req.body.duration);

    if (!title) {
      return res.status(400).json({ message: 'Exam title is required' });
    }

    if (!subject || !String(subject).trim()) {
      return res.status(400).json({ message: 'Exam subject is required' });
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      return res.status(400).json({ message: 'Exam duration must be a positive number' });
    }

    const exam = await ExamModel.create({
      ...req.body,
      title,
      subject,
      duration,
    });

    return res.status(201).json(exam);
  } catch (err) {
    logger.error('Failed to create exam', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateExam = async (req: Request, res: Response) => {
  try {
    const title = String(req.body.title ?? '').trim();
    const subject = normalizeSubject(req.body.subject);
    const duration = Number(req.body.duration);

    if (!title) {
      return res.status(400).json({ message: 'Exam title is required' });
    }

    if (!subject || !String(subject).trim()) {
      return res.status(400).json({ message: 'Exam subject is required' });
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      return res.status(400).json({ message: 'Exam duration must be a positive number' });
    }

    const exam = await ExamModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body, title, subject, duration },
      { new: true }
    ).exec();

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    return res.status(200).json(exam);
  } catch (err) {
    logger.error('Failed to update exam', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteExam = async (req: Request, res: Response) => {
  try {
    const exam = await ExamModel.findByIdAndDelete(req.params.id).exec();

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    return res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (err) {
    logger.error('Failed to delete exam', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default { getAllExams, getExamById, createExam, updateExam, deleteExam };
