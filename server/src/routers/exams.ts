import { Router } from 'express';
import { AppDataSource } from '../config/data-source';
import { Exam } from '../entities/Exam';

const router = Router();
const repo = () => AppDataSource.getRepository(Exam);

// GET /exams?page=1&limit=10&search=term
router.get('/', async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const search = (req.query.search as string) || '';

        const qb = repo().createQueryBuilder('exam');
        if (search) {
            qb.where('exam.title ILIKE :s OR exam.description ILIKE :s', { s: `%${search}%` });
        }

        const [items, total] = await qb
            .orderBy('exam.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        res.json({ items, total, page, limit });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exams', details: err });
    }
});

router.post('/', async (req, res) => {
    try {
        const exam = repo().create(req.body);
        const saved = await repo().save(exam);
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create exam', details: err });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await repo().update(id, req.body);
        const updated = await repo().findOneBy({ id });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update exam', details: err });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await repo().delete(id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete exam', details: err });
    }
});

export default router;
