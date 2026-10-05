require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const Member = require('../models/Member');
const BorrowRecord = require('../models/BorrowRecord');

const seedData = async (forceClear = true) => {
  try {
    if (forceClear) {
      console.log('[Seed] Clearing existing collections...');
      await User.deleteMany({});
      await Book.deleteMany({});
      await Member.deleteMany({});
      await BorrowRecord.deleteMany({});
    }

    // 1. Seed Librarian User
    const librarianEmail = process.env.SEED_LIBRARIAN_EMAIL || 'librarian@shelflife.edu';
    const librarianPassword = process.env.SEED_LIBRARIAN_PASSWORD || 'password123';

    const librarian = await User.create({
      email: librarianEmail,
      password: librarianPassword,
      role: 'librarian',
    });
    console.log(`[Seed] Created librarian user: ${librarian.email}`);

    // 2. Seed Books
    const books = await Book.create([
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        ISBN: '9780132350884',
        genre: 'Programming',
        totalCopies: 5,
        availableCopies: 4, // 1 borrowed in seed
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt & David Thomas',
        ISBN: '9780201616224',
        genre: 'Programming',
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        ISBN: '9780262033848',
        genre: 'Computer Science',
        totalCopies: 3,
        availableCopies: 2, // 1 borrowed in seed
      },
      {
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        ISBN: '9780201633610',
        genre: 'Software Architecture',
        totalCopies: 2,
        availableCopies: 2,
      },
      {
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell & Peter Norvig',
        ISBN: '9780136042594',
        genre: 'Artificial Intelligence',
        totalCopies: 3,
        availableCopies: 3,
      },
    ]);
    console.log(`[Seed] Created ${books.length} sample books.`);

    // 3. Seed Members
    const members = await Member.create([
      {
        name: 'Alice Smith',
        email: 'alice.smith@university.edu',
        membershipId: 'MEM-2026-001',
      },
      {
        name: 'Bob Jones',
        email: 'bob.jones@university.edu',
        membershipId: 'MEM-2026-002',
      },
      {
        name: 'Charlie Brown',
        email: 'charlie.brown@university.edu',
        membershipId: 'MEM-2026-003',
      },
    ]);
    console.log(`[Seed] Created ${members.length} sample members.`);

    // 4. Seed Borrow Records:
    // a) Active issued record (Clean Code issued to Alice)
    const activeDueDate = new Date();
    activeDueDate.setDate(activeDueDate.getDate() + 14);

    await BorrowRecord.create({
      book: books[0]._id,
      member: members[0]._id,
      issueDate: new Date(),
      dueDate: activeDueDate,
      returnDate: null,
      status: 'issued',
    });

    // b) Overdue record (Algorithms issued to Alice in past, overdue)
    const pastIssueDate = new Date();
    pastIssueDate.setDate(pastIssueDate.getDate() - 30);
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 16);

    await BorrowRecord.create({
      book: books[2]._id,
      member: members[0]._id,
      issueDate: pastIssueDate,
      dueDate: pastDueDate,
      returnDate: null,
      status: 'issued', // Will be detected as overdue upon history retrieval
    });

    console.log(`[Seed] Created sample borrow records.`);

    console.log('\n===============================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY');
    console.log(' Credentials for local testing:');
    console.log(`   Email:    ${librarianEmail}`);
    console.log(`   Password: ${librarianPassword}`);
    console.log('===============================================\n');

    return true;
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    throw error;
  }
};

const seedIfEmpty = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('[Seed] Database is empty. Auto-seeding initial librarian and catalog...');
    await seedData(false);
  }
};

if (require.main === module) {
  (async () => {
    console.log('[Seed] Connecting to database...');
    await connectDB();
    await seedData(true);
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = {
  seedData,
  seedIfEmpty,
};
