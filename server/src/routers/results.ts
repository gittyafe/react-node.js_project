import express from 'express';
import { submitResult, getResults } from '../controllers/results.controller';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, submitResult);
router.get('/', authMiddleware, getResults);

export default router;
