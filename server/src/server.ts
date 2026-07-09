import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/data-source';
import examsRouter from './routers/exams';
import questionsRouter from './routers/questions';
import resultsRouter from './routers/results';

const app = express();
app.use(express.json());
app.use(cors());

initializeDatabase()
  .then(() => {
    // mount API routers
    app.use('/exams', examsRouter);
    app.use('/questions', questionsRouter);
    app.use('/results', resultsRouter);

    app.listen(3000, () => {
      console.log('🚀 Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('❌ Error during Data Source initialization:', err);
  });
