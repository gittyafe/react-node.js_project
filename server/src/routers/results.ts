import { Router } from 'express';
import { In } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Result } from '../entities/Result';
import { Question, QuestionType } from '../entities/Question';
import { Exam } from '../entities/Exam';

const router = Router();
const repo = () => AppDataSource.getRepository(Result);

// POST /results -> submit answers and auto-grade
router.post('/', async (req, res) => {
    try {
        const { examId, userId, answers } = req.body as { examId: string; userId?: string; answers: { questionId: string; answer: any }[] };
        const exam = await AppDataSource.getRepository(Exam).findOneBy({ id: examId });
        if (!exam) return res.status(400).json({ error: 'Exam not found' });

        const questionIds = answers.map((a) => a.questionId);
        const questions = await AppDataSource.getRepository(Question).find({ where: { id: In(questionIds) } });

        let score = 0;
        for (const a of answers) {
            const q = questions.find((x) => x.id === a.questionId);
            if (!q) continue;

            const points = q.points || 0;
            const given = String(a.answer ?? '').trim().toLowerCase();
            const expected = String(q.correctAnswer ?? '').trim().toLowerCase();

            if (q.type === QuestionType.MULTIPLE_CHOICE) {
                try {
                    const expectedArr = JSON.parse(q.correctAnswer || '[]');
                    if (Array.isArray(expectedArr)) {
                        const givenArr = Array.isArray(a.answer) ? a.answer : [a.answer];
                        const expectedSet = new Set(expectedArr.map((item: string) => String(item).trim().toLowerCase()));
                        const givenSet = new Set(givenArr.map((item: any) => String(item).trim().toLowerCase()));
                        let matched = 0;
                        for (const item of givenSet) {
                            if (expectedSet.has(item)) matched += 1;
                        }
                        const ratio = matched / Math.max(expectedSet.size, 1);
                        score += Math.round(points * ratio);
                        continue;
                    }
                } catch {
                    // fallback to single-answer handling below
                }

                if (given === expected) score += points;
            } else if (q.type === QuestionType.TRUE_FALSE) {
                const normalizedExpected = expected === 'true' || expected === 'false' ? expected : 'false';
                if (given === normalizedExpected) score += points;
            } else {
                if (given === expected) score += points;
            }
        }

        const result = repo().create({ exam, userId, answers, score });
        const saved = await repo().save(result);
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save result', details: err });
    }
});

router.get('/', async (req, res) => {
    try {
        const items = await repo().find({ relations: { exam: true } });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch results', details: err });
    }
});

export default router;
