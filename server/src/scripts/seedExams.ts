import connectMongo from '../config/mongo';
import ExamModel from '../models/Exam';

const examSeeds = [
  { title: 'Algebra Foundations', subject: 'Mathematics', description: 'Core algebra concepts, equations, and expressions.', duration: 45 },
  { title: 'Geometry Essentials', subject: 'Mathematics', description: 'Angles, shapes, proofs, and coordinate geometry.', duration: 50 },
  { title: 'Statistics Practice', subject: 'Mathematics', description: 'Data analysis, probability, and interpretation of results.', duration: 40 },
  { title: 'Calculus Readiness', subject: 'Mathematics', description: 'Limits, derivatives, and functions review.', duration: 60 },

  { title: 'Biology Basics', subject: 'Science', description: 'Cells, organisms, genetics, and ecosystems.', duration: 45 },
  { title: 'Chemistry Fundamentals', subject: 'Science', description: 'Atomic structure, reactions, and bonding.', duration: 50 },
  { title: 'Physics Concepts', subject: 'Science', description: 'Motion, force, energy, and simple machines.', duration: 55 },
  { title: 'Earth Science Quiz', subject: 'Science', description: 'Rocks, weather, planets, and environmental systems.', duration: 35 },

  { title: 'World History Survey', subject: 'History', description: 'Civilizations, revolutions, and turning points in history.', duration: 50 },
  { title: 'Modern Era Review', subject: 'History', description: 'Industrialization, global conflict, and modern change.', duration: 45 },
  { title: 'Ancient Civilizations', subject: 'History', description: 'Egypt, Rome, Greece, and early empires.', duration: 40 },
  { title: 'Historical Thinking', subject: 'History', description: 'Source analysis, evidence, and interpretation.', duration: 35 },

  { title: 'English Reading Skills', subject: 'English', description: 'Comprehension, inference, and literary analysis.', duration: 45 },
  { title: 'Grammar Mastery', subject: 'English', description: 'Sentence structure, punctuation, and style.', duration: 35 },
  { title: 'Essay Writing Workshop', subject: 'English', description: 'Argument, organization, thesis, and editing.', duration: 50 },
  { title: 'Literature Review', subject: 'English', description: 'Themes, characters, and literary devices.', duration: 55 },

  { title: 'Programming Basics', subject: 'Computer Science', description: 'Variables, logic, loops, and problem solving.', duration: 45 },
  { title: 'Web Development Quiz', subject: 'Computer Science', description: 'HTML, CSS, JavaScript, and web structure.', duration: 50 },
  { title: 'Algorithms Intro', subject: 'Computer Science', description: 'Sorting, searching, and algorithmic thinking.', duration: 55 },
  { title: 'Database Fundamentals', subject: 'Computer Science', description: 'Schemas, queries, and data relationships.', duration: 40 },

  { title: 'Business Principles', subject: 'Business', description: 'Operations, strategy, and entrepreneurship basics.', duration: 45 },
  { title: 'Marketing Essentials', subject: 'Business', description: 'Branding, customer segments, and market strategy.', duration: 40 },
  { title: 'Finance Fundamentals', subject: 'Business', description: 'Budgets, profit, and financial decision-making.', duration: 55 },
  { title: 'Management Concepts', subject: 'Business', description: 'Leadership, teams, planning, and productivity.', duration: 35 },

  { title: 'Art Appreciation', subject: 'Art', description: 'Style, composition, and visual culture.', duration: 30 },
  { title: 'Drawing Techniques', subject: 'Art', description: 'Observation, proportion, shading, and form.', duration: 35 },
  { title: 'Design Fundamentals', subject: 'Art', description: 'Color theory, balance, and creative practice.', duration: 40 },
  { title: 'Visual Communication', subject: 'Art', description: 'Symbols, layout, and message design.', duration: 45 },

  { title: 'General Knowledge Check', subject: 'General', description: 'Broad review of everyday knowledge and reasoning.', duration: 30 },
  { title: 'Critical Thinking', subject: 'General', description: 'Logic, analysis, and making sound judgments.', duration: 35 },
  { title: 'Problem Solving Sprint', subject: 'General', description: 'Reasoning and practical challenge scenarios.', duration: 40 },
  { title: 'Academic Readiness', subject: 'General', description: 'Overview of essential skills for learning success.', duration: 45 },
];

async function main() {
  await connectMongo();

  const results = await Promise.all(
    examSeeds.map((exam) =>
      ExamModel.updateOne(
        { title: exam.title, subject: exam.subject },
        { $set: exam },
        { upsert: true }
      )
    )
  );

  const total = results.reduce((sum, item) => sum + (item.upsertedCount ?? 0) + (item.modifiedCount ?? 0), 0);

  console.log(`✅ Seeded ${examSeeds.length} exam definitions across ${new Set(examSeeds.map((exam) => exam.subject)).size} subjects.`);
  console.log(`Mongo write results: ${total} item operations executed.`);

  const count = await ExamModel.countDocuments();
  console.log(`Total exams in database: ${count}`);

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Failed to seed exams:', error);
  process.exit(1);
});
