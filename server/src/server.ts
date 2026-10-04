import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import connectMongo from './config/mongo';
import { swaggerSpec } from './config/swagger';
import userRouter from './routers/users';
import authRouter from './routers/auth';
import examRouter from './routers/exams';
import questionsRouter from './routers/questions';
import resultsRouter from './routers/results';
import logger from './config/logger';
import { shouldSeedDemoData } from './config/runtime';
import { seedDemoData } from './scripts/seedDemoData';

const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim());

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS blocked this origin'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/exams', examRouter);
app.use('/questions', questionsRouter);
app.use('/results', resultsRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('[SERVER ERROR]', err);
  res.status(500).json({ message: 'Internal server error' });
});

export const startServer = async () => {
  try {
    await connectMongo();
    if (shouldSeedDemoData()) {
      await seedDemoData();
      console.log('✅ Demo data seeded');
    }
    console.log('✅ Mongo ready — starting server');
    const port = Number(process.env.PORT || 3000);
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
    return app;
  } catch (err) {
    console.error('❌ Failed to connect to Mongo:', err);
    throw err;
  }
};

if (require.main === module) {
  void startServer();
}
