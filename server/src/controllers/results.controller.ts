import { Request, Response } from 'express';
import logger from '../config/logger';
import resultsService from '../services/results.service';
import { UserRole } from '../entities/users/user-role.enum';

export const normalizeSubmissionPayload = (
  payload: any,
  currentUser?: { id?: string; _id?: string; role?: string; email?: string }
) => {
  const nextPayload = { ...payload };
  const userId = currentUser?.id ?? currentUser?._id;

  if (!nextPayload.studentId && userId) {
    nextPayload.studentId = userId;
  }

  if (typeof nextPayload.studentId === 'string' && nextPayload.studentId.trim() === '') {
    nextPayload.studentId = undefined;
  }

  return nextPayload;
};

// Expect body: { studentId, examId, answers: [{ questionId, answer }] }
export const submitResult = async (req: Request, res: Response) => {
  try {
    const payload = normalizeSubmissionPayload(req.body, req.user);

    if (!payload.examId) {
      return res.status(400).json({ message: 'Exam ID is required' });
    }

    if (!Array.isArray(payload.answers)) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    if (!payload.studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    if (req.user && req.user.role === UserRole.STUDENT && payload.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Students can only submit their own results' });
    }

    const result = await resultsService.submitResultService(payload);
    return res.status(201).json(result);
  } catch (err) {
    logger.error('Failed to submit result', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getResults = async (req: Request, res: Response) => {
  try {
    const { studentId, examId } = req.query as any;
    const filter: any = {};

    if (req.user?.role === UserRole.STUDENT) {
      filter.studentId = req.user.id;
      if (studentId && studentId !== req.user.id) {
        return res.status(403).json({ message: 'Students can only view their own results' });
      }
    } else if (studentId) {
      filter.studentId = studentId;
    }

    if (examId) filter.examId = examId;
    const results = await resultsService.getResults ? await resultsService.getResults(filter) : [];
    return res.status(200).json(results);
  } catch (err) {
    logger.error('Failed to get results', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default { submitResult, getResults };
