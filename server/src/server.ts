import express from 'express';
import { AppDataSource } from '../src/config/data-source';

const app = express();
app.use(express.json());

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