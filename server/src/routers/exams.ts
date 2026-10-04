import express from 'express';
import { getAllExams, getExamById, createExam, updateExam, deleteExam } from '../controllers/exam.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { UserRole } from '../entities/users/user-role.enum';
import { canManageExams } from '../config/permissions';

const router = express.Router();

router.get('/', authMiddleware, getAllExams);
router.get('/:id', authMiddleware, getExamById);
router.post('/', authMiddleware, (req, res, next) => {
  if (!canManageExams(req.user)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
}, createExam);
router.put('/:id', authMiddleware, (req, res, next) => {
  if (!canManageExams(req.user)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
}, updateExam);
router.delete('/:id', authMiddleware, (req, res, next) => {
  if (!canManageExams(req.user)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
}, deleteExam);

export default router;
