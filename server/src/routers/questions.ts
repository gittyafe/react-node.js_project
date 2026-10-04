import express from 'express';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../controllers/questions.controller';
import { authMiddleware } from '../middleware/auth';
import { canManageQuestions } from '../config/permissions';

const router = express.Router();

router.get('/', authMiddleware, getQuestions);
router.post('/', authMiddleware, (req, res, next) => {
  if (!canManageQuestions(req.user)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
}, createQuestion);
router.put('/:id', authMiddleware, (req, res, next) => {
  if (!canManageQuestions(req.user)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
}, updateQuestion);
router.delete('/:id', authMiddleware, (req, res, next) => {
  if (!canManageQuestions(req.user)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
}, deleteQuestion);

export default router;
