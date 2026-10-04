import bcrypt from 'bcrypt';
import connectMongo from '../config/mongo';
import UserModel from '../models/User';
import ExamModel from '../models/Exam';
import QuestionModel from '../models/Question';
import { UserRole } from '../entities/users/user-role.enum';

const examSeeds = [
  { title: 'Algebra Foundations', subject: 'Mathematics', difficulty: 'easy', description: 'Core algebra concepts, equations, and expressions.', duration: 45 },
  { title: 'Geometry Essentials', subject: 'Mathematics', difficulty: 'medium', description: 'Angles, shapes, proofs, and coordinate geometry.', duration: 50 },
  { title: 'Statistics Practice', subject: 'Mathematics', difficulty: 'hard', description: 'Data analysis, probability, and interpretation of results.', duration: 40 },
  { title: 'Calculus Readiness', subject: 'Mathematics', difficulty: 'hard', description: 'Limits, derivatives, and functions review.', duration: 60 },

  { title: 'Biology Basics', subject: 'Science', difficulty: 'easy', description: 'Cells, organisms, genetics, and ecosystems.', duration: 45 },
  { title: 'Chemistry Fundamentals', subject: 'Science', difficulty: 'medium', description: 'Atomic structure, reactions, and bonding.', duration: 50 },
  { title: 'Physics Concepts', subject: 'Science', difficulty: 'hard', description: 'Motion, force, energy, and simple machines.', duration: 55 },
  { title: 'Earth Science Quiz', subject: 'Science', difficulty: 'easy', description: 'Rocks, weather, planets, and environmental systems.', duration: 35 },

  { title: 'World History Survey', subject: 'History', difficulty: 'medium', description: 'Civilizations, revolutions, and turning points in history.', duration: 50 },
  { title: 'Modern Era Review', subject: 'History', difficulty: 'hard', description: 'Industrialization, global conflict, and modern change.', duration: 45 },
  { title: 'Ancient Civilizations', subject: 'History', difficulty: 'easy', description: 'Egypt, Rome, Greece, and early empires.', duration: 40 },
  { title: 'Historical Thinking', subject: 'History', difficulty: 'medium', description: 'Source analysis, evidence, and interpretation.', duration: 35 },

  { title: 'English Reading Skills', subject: 'English', difficulty: 'easy', description: 'Comprehension, inference, and literary analysis.', duration: 45 },
  { title: 'Grammar Mastery', subject: 'English', difficulty: 'medium', description: 'Sentence structure, punctuation, and style.', duration: 35 },
  { title: 'Essay Writing Workshop', subject: 'English', difficulty: 'hard', description: 'Argument, organization, thesis, and editing.', duration: 50 },
  { title: 'Literature Review', subject: 'English', difficulty: 'medium', description: 'Themes, characters, and literary devices.', duration: 55 },

  { title: 'Programming Basics', subject: 'Computer Science', difficulty: 'easy', description: 'Variables, logic, loops, and problem solving.', duration: 45 },
  { title: 'Web Development Quiz', subject: 'Computer Science', difficulty: 'medium', description: 'HTML, CSS, JavaScript, and web structure.', duration: 50 },
  { title: 'Algorithms Intro', subject: 'Computer Science', difficulty: 'hard', description: 'Sorting, searching, and algorithmic thinking.', duration: 55 },
  { title: 'Database Fundamentals', subject: 'Computer Science', difficulty: 'medium', description: 'Schemas, queries, and data relationships.', duration: 40 },

  { title: 'Business Principles', subject: 'Business', difficulty: 'easy', description: 'Operations, strategy, and entrepreneurship basics.', duration: 45 },
  { title: 'Marketing Essentials', subject: 'Business', difficulty: 'medium', description: 'Branding, customer segments, and market strategy.', duration: 40 },
  { title: 'Finance Fundamentals', subject: 'Business', difficulty: 'hard', description: 'Budgets, profit, and financial decision-making.', duration: 55 },
  { title: 'Management Concepts', subject: 'Business', difficulty: 'medium', description: 'Leadership, teams, planning, and productivity.', duration: 35 },

  { title: 'Art Appreciation', subject: 'Art', difficulty: 'easy', description: 'Style, composition, and visual culture.', duration: 30 },
  { title: 'Drawing Techniques', subject: 'Art', difficulty: 'medium', description: 'Observation, proportion, shading, and form.', duration: 35 },
  { title: 'Design Fundamentals', subject: 'Art', difficulty: 'hard', description: 'Color theory, balance, and creative practice.', duration: 40 },
  { title: 'Visual Communication', subject: 'Art', difficulty: 'medium', description: 'Symbols, layout, and message design.', duration: 45 },

  { title: 'General Knowledge Check', subject: 'General', difficulty: 'easy', description: 'Broad review of everyday knowledge and reasoning.', duration: 30 },
  { title: 'Critical Thinking', subject: 'General', difficulty: 'medium', description: 'Logic, analysis, and making sound judgments.', duration: 35 },
  { title: 'Problem Solving Sprint', subject: 'General', difficulty: 'hard', description: 'Reasoning and practical challenge scenarios.', duration: 40 },
  { title: 'Academic Readiness', subject: 'General', difficulty: 'medium', description: 'Overview of essential skills for learning success.', duration: 45 },
];

const demoUsers = [
  { fullName: 'Admin User', email: 'admin@smarttest.io', password: 'admin123', role: UserRole.ADMIN },
  { fullName: 'Teacher User', email: 'teacher@smarttest.io', password: 'teacher123', role: UserRole.TEACHER },
  { fullName: 'Student User', email: 'student@smarttest.io', password: 'student123', role: UserRole.STUDENT },
];

const buildQuestionSet = (examTitle: string, subject: string) => {
  const subjectLabel = subject.toLowerCase();
  const titleLabel = examTitle.toLowerCase();

  const baseQuestions = [
    {
      questionText: `Which answer best reflects the core idea of ${examTitle}?`,
      options: ['A practical concept with clear application', 'A random unrelated fact', 'A theoretical detail with no use', 'An invalid option'],
      correctAnswer: 'A practical concept with clear application',
      points: 2,
    },
    {
      questionText: `What is the most important skill required for success in ${titleLabel}?`,
      options: ['Understanding key concepts', 'Ignoring examples', 'Avoiding practice', 'Skipping review'],
      correctAnswer: 'Understanding key concepts',
      points: 2,
    },
    {
      questionText: `Which statement is most accurate for ${subjectLabel} studies?`,
      options: ['Practice and review improve performance', 'No preparation is needed', 'Only memorization without understanding works', 'The topic should be avoided'],
      correctAnswer: 'Practice and review improve performance',
      points: 2,
    },
  ];

  if (subject === 'Mathematics') {
    return [
      {
        questionText: 'Solve: 3x + 6 = 18',
        options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
        correctAnswer: 'x = 4',
        points: 2,
      },
      {
        questionText: 'Which shape has three sides?',
        options: ['Square', 'Triangle', 'Circle', 'Rectangle'],
        correctAnswer: 'Triangle',
        points: 2,
      },
      {
        questionText: 'What is 25% of 80?',
        options: ['10', '15', '20', '25'],
        correctAnswer: '20',
        points: 2,
      },
    ];
  }

  if (subject === 'Science') {
    return [
      {
        questionText: 'Which organ pumps blood through the body?',
        options: ['Brain', 'Lungs', 'Heart', 'Kidney'],
        correctAnswer: 'Heart',
        points: 2,
      },
      {
        questionText: 'What is the chemical symbol for water?',
        options: ['O2', 'H2O', 'CO2', 'NaCl'],
        correctAnswer: 'H2O',
        points: 2,
      },
      {
        questionText: 'Which force pulls objects toward Earth?',
        options: ['Magnetism', 'Gravity', 'Friction', 'Pressure'],
        correctAnswer: 'Gravity',
        points: 2,
      },
    ];
  }

  if (subject === 'History') {
    return [
      {
        questionText: 'Which source is most useful for understanding how people lived in the past?',
        options: ['A diary', 'A random website', 'A weather report', 'A modern advertisement'],
        correctAnswer: 'A diary',
        points: 2,
      },
      {
        questionText: 'What is a primary source?',
        options: ['A firsthand account', 'A summary by a teacher', 'A textbook comment', 'A movie review'],
        correctAnswer: 'A firsthand account',
        points: 2,
      },
      {
        questionText: 'Why do historians compare multiple sources?',
        options: ['To check reliability and perspective', 'To avoid reading', 'To shorten time', 'To replace evidence'],
        correctAnswer: 'To check reliability and perspective',
        points: 2,
      },
    ];
  }

  if (subject === 'English') {
    return [
      {
        questionText: 'Which sentence is grammatically correct?',
        options: ['She go to school every day.', 'She goes to school every day.', 'She going to school every day.', 'She gone to school every day.'],
        correctAnswer: 'She goes to school every day.',
        points: 2,
      },
      {
        questionText: 'What is a thesis statement?',
        options: ['A main argument in an essay', 'A final sentence in a paragraph', 'A title only', 'An unrelated question'],
        correctAnswer: 'A main argument in an essay',
        points: 2,
      },
      {
        questionText: 'Which word is a synonym for "happy"?',
        options: ['Sad', 'Joyful', 'Angry', 'Cold'],
        correctAnswer: 'Joyful',
        points: 2,
      },
    ];
  }

  if (subject === 'Computer Science') {
    return [
      {
        questionText: 'What does HTML define in a web page?',
        options: ['Structure', 'Database', 'Security', 'Audio processing'],
        correctAnswer: 'Structure',
        points: 2,
      },
      {
        questionText: 'Which loop repeats a block of code a fixed number of times?',
        options: ['for loop', 'if statement', 'switch case', 'alert'],
        correctAnswer: 'for loop',
        points: 2,
      },
      {
        questionText: 'What is a variable used for?',
        options: ['Store data', 'Delete files', 'Hide text', 'Prevent layout'],
        correctAnswer: 'Store data',
        points: 2,
      },
    ];
  }

  if (subject === 'Business') {
    return [
      {
        questionText: 'What is the main goal of a business?',
        options: ['Create value and earn profit', 'Avoid customers', 'Ignore costs', 'Stop planning'],
        correctAnswer: 'Create value and earn profit',
        points: 2,
      },
      {
        questionText: 'Which concept is most related to marketing?',
        options: ['Customer needs', 'Empty spaces', 'Random guessing', 'No pricing'],
        correctAnswer: 'Customer needs',
        points: 2,
      },
      {
        questionText: 'What does a budget help with?',
        options: ['Plan expenses and resources', 'Remove all data', 'Avoid decision-making', 'Create confusion'],
        correctAnswer: 'Plan expenses and resources',
        points: 2,
      },
    ];
  }

  if (subject === 'Art') {
    return [
      {
        questionText: 'Which element helps create visual balance in a design?',
        options: ['Symmetry', 'Noise', 'Confusion', 'Randomness'],
        correctAnswer: 'Symmetry',
        points: 2,
      },
      {
        questionText: 'What does contrast help achieve in art?',
        options: ['Emphasize differences', 'Reduce detail', 'Erase color', 'Remove focus'],
        correctAnswer: 'Emphasize differences',
        points: 2,
      },
      {
        questionText: 'Why is composition important?',
        options: ['It organizes visual elements', 'It deletes meaning', 'It creates silence', 'It prevents structure'],
        correctAnswer: 'It organizes visual elements',
        points: 2,
      },
    ];
  }

  return baseQuestions;
};

export async function seedDemoData() {
  for (const user of demoUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await UserModel.updateOne(
      { email: user.email },
      { $set: { ...user, password: hashedPassword } },
      { upsert: true }
    );
  }

  const examRecords = await Promise.all(
    examSeeds.map(async (exam) => {
      const created = await ExamModel.findOneAndUpdate(
        { title: exam.title, subject: exam.subject },
        { $set: exam },
        { upsert: true, new: true }
      );

      const questionSet = buildQuestionSet(exam.title, exam.subject);
      await QuestionModel.deleteMany({ examId: created?._id });
      await QuestionModel.insertMany(
        questionSet.map((question) => ({
          examId: created?._id,
          ...question,
        }))
      );

      return created;
    })
  );

  console.log(`✅ Ensured ${examRecords.length} exam seeds and ${demoUsers.length} demo users are present.`);
}

async function main() {
  await connectMongo();
  await seedDemoData();
  process.exit(0);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Demo seeding failed:', error);
    process.exit(1);
  });
}
