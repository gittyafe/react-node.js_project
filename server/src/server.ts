import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { AppDataSource } from './config/data-source';
import userRouter from './routers/users';
import authRouter from './routers/auth';
import 'reflect-metadata';

const app = express();

app.use(cors());
app.use(express.json());
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
app.use('/auth', authRouter);
app.use('/users', userRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ message: 'Internal server error' });
});

// אתחול החיבור למסד הנתונים
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Data Source has been initialized!');

    // רק אחרי שהחיבור הצליח, השרת יעלה
    app.listen(3000, () => {
      console.log('🚀 Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('❌ Error during Data Source initialization:', err);
  });
  