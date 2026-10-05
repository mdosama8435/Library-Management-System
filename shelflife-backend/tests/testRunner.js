process.env.NODE_ENV = 'test';
process.env.USE_MEMORY_DB = 'true';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.PORT = '5001';

const http = require('http');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Book = require('../src/models/Book');
const Member = require('../src/models/Member');
const BorrowRecord = require('../src/models/BorrowRecord');

let server;
let baseUrl;

// Helper to make HTTP requests
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(rawData);
          } catch (e) {
            parsed = rawData;
          }
          resolve({
            status: res.statusCode,
            body: parsed,
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log(' RUNNING SHELFLIFE BACKEND TEST SUITE (Q1 EXAM VERIFICATION)');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (description, condition, details = '') => {
    if (condition) {
      console.log(`  PASS: ${description}`);
      passed++;
    } else {
      console.error(`  FAIL: ${description} ${details}`);
      failed++;
    }
  };

  try {
    // 1. Initialize embedded test database & HTTP server
    console.log('[Setup] Connecting to in-memory database...');
    await connectDB();
    await User.deleteMany({});
    await Book.deleteMany({});
    await Member.deleteMany({});
    await BorrowRecord.deleteMany({});

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(5001, resolve));
    baseUrl = 'http://localhost:5001';
    console.log('[Setup] Test server running at ' + baseUrl);

    // -----------------------------------------------------------------
    // TEST 1: Health Check Endpoint
    // -----------------------------------------------------------------
    console.log('\n--- 1. Health Check Endpoint ---');
    const healthRes = await request('GET', '/health');
    assert('GET /health returns 200', healthRes.status === 200);
    assert('GET /health returns success: true', healthRes.body.success === true);
    assert(
      'GET /health returns expected message',
      healthRes.body.message === 'ShelfLife API is running'
    );

    // -----------------------------------------------------------------
    // TEST 2: Authentication & Librarian Login
    // -----------------------------------------------------------------
    console.log('\n--- 2. Authentication & Librarian Login ---');
    // Pre-create librarian user
    await User.create({
      email: 'librarian@shelflife.edu',
      password: 'password123',
      role: 'librarian',
    });

    // Test invalid login
    const badLoginRes = await request('POST', '/api/auth/login', {
      email: 'librarian@shelflife.edu',
      password: 'wrongpassword',
    });
    assert('Login with wrong password returns 401', badLoginRes.status === 401);
    assert('Login returns success: false on failure', badLoginRes.body.success === false);

    // Test successful login
    const goodLoginRes = await request('POST', '/api/auth/login', {
      email: 'librarian@shelflife.edu',
      password: 'password123',
    });
    assert('Login with valid credentials returns 200', goodLoginRes.status === 200);
    assert('Login returns JWT token', typeof goodLoginRes.body.token === 'string');
    assert('Login returns user role librarian', goodLoginRes.body.user.role === 'librarian');

    const librarianToken = goodLoginRes.body.token;

    // -----------------------------------------------------------------
    // TEST 3: Route Protection & Invalid JWT
    // -----------------------------------------------------------------
    console.log('\n--- 3. Route Protection & Invalid JWT ---');
    const noAuthRes = await request('POST', '/api/books', {
      title: 'Unauthorized Book',
      author: 'Author',
      ISBN: '1111111111',
      genre: 'General',
      totalCopies: 5,
      availableCopies: 5,
    });
    assert('Protected route without token returns 401', noAuthRes.status === 401);

    const badTokenRes = await request(
      'POST',
      '/api/books',
      {
        title: 'Unauthorized Book',
        author: 'Author',
        ISBN: '1111111111',
        genre: 'General',
        totalCopies: 5,
        availableCopies: 5,
      },
      'bad.jwt.token'
    );
    assert('Protected route with invalid JWT returns 401', badTokenRes.status === 401);

    // -----------------------------------------------------------------
    // TEST 4: Book Creation & Validation
    // -----------------------------------------------------------------
    console.log('\n--- 4. Book Creation & Validation ---');
    // Test validation failure: availableCopies > totalCopies
    const invalidCopiesRes = await request(
      'POST',
      '/api/books',
      {
        title: 'Invalid Book',
        author: 'Author',
        ISBN: '9780132350884',
        genre: 'Tech',
        totalCopies: 2,
        availableCopies: 5, // invalid!
      },
      librarianToken
    );
    assert(
      'Book with availableCopies > totalCopies rejected with 400',
      invalidCopiesRes.status === 400
    );

    // Test valid book creation
    const bookData1 = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      ISBN: '9780132350884',
      genre: 'Programming',
      totalCopies: 5,
      availableCopies: 5,
    };
    const createBookRes1 = await request('POST', '/api/books', bookData1, librarianToken);
    assert('Valid book creation returns 201', createBookRes1.status === 201);
    assert('Created book has correct title', createBookRes1.body.data.title === 'Clean Code');
    assert('Created book has correct ISBN', createBookRes1.body.data.ISBN === '9780132350884');
    const bookId1 = createBookRes1.body.data._id;

    // Test duplicate ISBN conflict
    const dupIsbnRes = await request('POST', '/api/books', bookData1, librarianToken);
    assert('Duplicate ISBN creation rejected with 409 Conflict', dupIsbnRes.status === 409);

    // Create more books for pagination and genre filtering tests
    await request(
      'POST',
      '/api/books',
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt',
        ISBN: '9780201616224',
        genre: 'Programming',
        totalCopies: 3,
        availableCopies: 3,
      },
      librarianToken
    );

    await request(
      'POST',
      '/api/books',
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        ISBN: '9780262033848',
        genre: 'Computer Science',
        totalCopies: 4,
        availableCopies: 4,
      },
      librarianToken
    );

    await request(
      'POST',
      '/api/books',
      {
        title: 'Design Patterns',
        author: 'Erich Gamma',
        ISBN: '9780201633610',
        genre: 'Architecture',
        totalCopies: 2,
        availableCopies: 2,
      },
      librarianToken
    );

    // -----------------------------------------------------------------
    // TEST 5: Book Listing, Pagination & Genre Filtering
    // -----------------------------------------------------------------
    console.log('\n--- 5. Book Listing, Pagination & Genre Filtering ---');
    // Public GET /api/books (No auth required)
    const listBooksRes = await request('GET', '/api/books?page=1&limit=2');
    assert('GET /api/books returns 200 without auth', listBooksRes.status === 200);
    assert('Pagination limit respected (length === 2)', listBooksRes.body.data.length === 2);
    assert('Pagination metadata total === 4', listBooksRes.body.pagination.total === 4);
    assert('Pagination metadata totalPages === 2', listBooksRes.body.pagination.totalPages === 2);

    // Filter by genre
    const filterGenreRes = await request('GET', '/api/books?genre=Programming');
    assert('GET /api/books?genre=Programming returns 200', filterGenreRes.status === 200);
    assert('Genre filter returns 2 books', filterGenreRes.body.data.length === 2);
    const allProg = filterGenreRes.body.data.every((b) => b.genre === 'Programming');
    assert('All filtered books have genre Programming', allProg);

    // -----------------------------------------------------------------
    // TEST 6: Member Registration & Validation
    // -----------------------------------------------------------------
    console.log('\n--- 6. Member Registration & Validation ---');
    // Invalid email validation
    const badEmailMemberRes = await request(
      'POST',
      '/api/members',
      {
        name: 'Bad Email Member',
        email: 'invalid-email-address',
        membershipId: 'MEM-001',
      },
      librarianToken
    );
    assert('Invalid member email rejected with 400', badEmailMemberRes.status === 400);

    // Valid member creation
    const memberData1 = {
      name: 'Alice Smith',
      email: 'alice.smith@university.edu',
      membershipId: 'MEM-2026-001',
    };
    const createMemberRes1 = await request('POST', '/api/members', memberData1, librarianToken);
    assert('Valid member registration returns 201', createMemberRes1.status === 201);
    assert('Created member has correct membershipId', createMemberRes1.body.data.membershipId === 'MEM-2026-001');
    const memberId1 = createMemberRes1.body.data._id;

    // Duplicate email conflict
    const dupEmailMemberRes = await request(
      'POST',
      '/api/members',
      {
        name: 'Another Alice',
        email: 'alice.smith@university.edu',
        membershipId: 'MEM-2026-002',
      },
      librarianToken
    );
    assert('Duplicate member email rejected with 409', dupEmailMemberRes.status === 409);

    // Duplicate membershipId conflict
    const dupIdMemberRes = await request(
      'POST',
      '/api/members',
      {
        name: 'Another Bob',
        email: 'bob@university.edu',
        membershipId: 'MEM-2026-001',
      },
      librarianToken
    );
    assert('Duplicate membershipId rejected with 409', dupIdMemberRes.status === 409);

    // -----------------------------------------------------------------
    // TEST 7: Issuing Books & AvailableCopies Decrement
    // -----------------------------------------------------------------
    console.log('\n--- 7. Issuing Books & AvailableCopies Decrement ---');
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const issueRes1 = await request(
      'POST',
      '/api/borrow',
      {
        bookId: bookId1,
        memberId: memberId1,
        dueDate: dueDate.toISOString(),
      },
      librarianToken
    );
    assert('Issuing a book returns 201', issueRes1.status === 201);
    assert('BorrowRecord status is issued', issueRes1.body.data.status === 'issued');
    const borrowRecordId1 = issueRes1.body.data._id;

    // Check availableCopies decremented on book
    const checkBookAfterIssue = await Book.findById(bookId1);
    assert(
      'Book availableCopies decremented from 5 to 4',
      checkBookAfterIssue.availableCopies === 4
    );

    // -----------------------------------------------------------------
    // TEST 8: Concurrency & Race Condition Simulation
    // -----------------------------------------------------------------
    console.log('\n--- 8. Concurrency & Race Condition Simulation ---');
    // Create a special book with totalCopies: 1, availableCopies: 1
    const singleCopyBook = await Book.create({
      title: 'Rare Manuscript',
      author: 'Ancient Scholar',
      ISBN: '9789999999999',
      genre: 'History',
      totalCopies: 1,
      availableCopies: 1,
    });

    // Create a second member
    const member2 = await Member.create({
      name: 'Bob Jones',
      email: 'bob.jones@university.edu',
      membershipId: 'MEM-2026-002',
    });

    console.log('  Simulating two simultaneous librarians issuing the last copy...');
    const [concurrentRes1, concurrentRes2] = await Promise.all([
      request(
        'POST',
        '/api/borrow',
        {
          bookId: singleCopyBook._id.toString(),
          memberId: memberId1,
          dueDate: dueDate.toISOString(),
        },
        librarianToken
      ),
      request(
        'POST',
        '/api/borrow',
        {
          bookId: singleCopyBook._id.toString(),
          memberId: member2._id.toString(),
          dueDate: dueDate.toISOString(),
        },
        librarianToken
      ),
    ]);

    const statuses = [concurrentRes1.status, concurrentRes2.status].sort();
    assert(
      'Exactly one concurrent request succeeds (201) and one is rejected (400)',
      statuses[0] === 200 || statuses[0] === 201 && statuses[1] === 400
    );

    const checkRareBook = await Book.findById(singleCopyBook._id);
    assert(
      'Final availableCopies is exactly 0 (never negative)',
      checkRareBook.availableCopies === 0
    );

    // Try issuing again when availableCopies === 0
    const zeroCopiesRes = await request(
      'POST',
      '/api/borrow',
      {
        bookId: singleCopyBook._id.toString(),
        memberId: memberId1,
        dueDate: dueDate.toISOString(),
      },
      librarianToken
    );
    assert(
      'Issuing when availableCopies === 0 is rejected with 400',
      zeroCopiesRes.status === 400
    );

    // -----------------------------------------------------------------
    // TEST 9: Member Borrowing History & Overdue Detection
    // -----------------------------------------------------------------
    console.log('\n--- 9. Member History & Overdue Handling ---');
    // Create an overdue record directly in DB to verify overdue handling
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 10);
    const pastIssueDate = new Date();
    pastIssueDate.setDate(pastIssueDate.getDate() - 24);

    await BorrowRecord.create({
      book: bookId1,
      member: memberId1,
      issueDate: pastIssueDate,
      dueDate: pastDueDate,
      returnDate: null,
      status: 'issued',
    });

    const historyRes = await request(
      'GET',
      `/api/members/${memberId1}/history`,
      null,
      librarianToken
    );
    assert('GET /api/members/:id/history returns 200', historyRes.status === 200);
    assert('History data contains records', Array.isArray(historyRes.body.data) && historyRes.body.data.length >= 2);
    
    // Check that the overdue record is dynamically represented as 'overdue'
    const overdueRecord = historyRes.body.data.find(
      (r) => new Date(r.dueDate) < new Date() && r.returnDate === null
    );
    assert('Past unreturned record has status overdue', overdueRecord && overdueRecord.status === 'overdue');
    assert('Book information is populated in history', !!overdueRecord.book.title);

    // -----------------------------------------------------------------
    // TEST 10: Returning a Book & AvailableCopies Increment
    // -----------------------------------------------------------------
    console.log('\n--- 10. Returning a Book & AvailableCopies Increment ---');
    const bookBeforeReturn = await Book.findById(bookId1);
    const copiesBeforeReturn = bookBeforeReturn.availableCopies;

    const returnRes = await request(
      'POST',
      '/api/return',
      { borrowId: borrowRecordId1 },
      librarianToken
    );
    assert('POST /api/return returns 200', returnRes.status === 200);
    assert('BorrowRecord status updated to returned', returnRes.body.data.status === 'returned');
    assert('BorrowRecord has valid returnDate', !!returnRes.body.data.returnDate);

    const bookAfterReturn = await Book.findById(bookId1);
    assert(
      'Book availableCopies incremented by 1',
      bookAfterReturn.availableCopies === copiesBeforeReturn + 1
    );

    // Try returning the same book again (double-return protection)
    const doubleReturnRes = await request(
      'POST',
      '/api/return',
      { borrowId: borrowRecordId1 },
      librarianToken
    );
    assert(
      'Returning already returned book is rejected with 400',
      doubleReturnRes.status === 400
    );

    // Also test returning via URL param: POST /api/return/:borrowId
    // Let's issue and return using param format
    const tempIssue = await request(
      'POST',
      '/api/borrow',
      {
        bookId: bookId1,
        memberId: memberId1,
        dueDate: dueDate.toISOString(),
      },
      librarianToken
    );
    const paramReturnRes = await request(
      'POST',
      `/api/return/${tempIssue.body.data._id}`,
      null,
      librarianToken
    );
    assert('POST /api/return/:borrowId returns 200', paramReturnRes.status === 200);

    // -----------------------------------------------------------------
    // TEST SUMMARY
    // -----------------------------------------------------------------
    console.log('\n======================================================');
    console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Unhandled test suite error:', error);
    process.exit(1);
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
  }
};

runTests();
