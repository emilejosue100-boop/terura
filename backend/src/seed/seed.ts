import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import {
  Cooperative,
  User,
  Transaction,
  LoanRequest,
  Opportunity,
} from '../models/index.js';
import { COOPERATIVE_NAME, defaultWelcomeTip } from './seedData.js';

dotenv.config();

async function seed() {
  await connectDB();

  console.log('Resetting database to empty cooperative...');
  await Promise.all([
    Cooperative.deleteMany({}),
    User.deleteMany({}),
    Transaction.deleteMany({}),
    LoanRequest.deleteMany({}),
    Opportunity.deleteMany({}),
  ]);

  await Cooperative.create({
    name: COOPERATIVE_NAME,
    groupSavings: 0,
    activeLoansCount: 0,
    activeLoansAmount: 0,
    defaultLanguage: 'en',
    currentTip: defaultWelcomeTip,
  });

  console.log(`Created cooperative: ${COOPERATIVE_NAME}`);
  console.log('\nSeed complete — database is empty and ready for real data.');
  console.log('Next steps:');
  console.log('  1. Set ADMIN_PHONE in backend/.env to your committee phone number');
  console.log('  2. npm run dev');
  console.log('  3. Register via login (first admin phone becomes committee) or use Admin → Register New Member');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
