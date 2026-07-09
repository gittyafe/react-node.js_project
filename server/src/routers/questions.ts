import { Router } from 'express';
import { AppDataSource } from '../config/data-source';
import { Question } from '../entities/Question';
import { Exam } from '../entities/Exam';

const router = Router();
const repo = () => AppDataSource.getRepository(Question);

router.get('/', async (req, res) => {
    try {
        const items = await repo().find({ relations: { exam: true } });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch questions', details: err });
    }
});

router.post('/', async (req, res) => {
    try {
        const { examId, ...rest } = req.body;
        const exam = examId ? await AppDataSource.getRepository(Exam).findOneBy({ id: examId }) : null;
        const q = repo().create({ ...rest, exam });
        const saved = await repo().save(q);
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create question', details: err });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await repo().update(id, req.body);
        const updated = await repo().findOne({ where: { id }, relations: { exam: true } });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update question', details: err });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await repo().delete(id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete question', details: err });
    }
});

export default router;
