# ShelfLife - College Library Management System (Backend API)
> **Full Stack Web Development IA2 — Question 1 Backend Implementation**

ShelfLife is a modular, production-ready RESTful backend API for college library management built with Node.js, Express.js, MongoDB, and Mongoose. It handles inventory management, member onboarding, book issuance, automated return processing, overdue calculation, and concurrency-safe copy decrements.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables](#environment-variables)
6. [MongoDB Setup & Reliability](#mongodb-setup--reliability)
7. [Running the Application](#running-the-application)
8. [Database Seeding](#database-seeding)
9. [Automated Testing](#automated-testing)
10. [Authentication & Authorization](#authentication--authorization)
11. [Race Condition Prevention (4–6 Line Dedicated Answer)](#race-condition-prevention-4-6-line-dedicated-answer)
12. [API Documentation & cURL Examples](#api-documentation--curl-examples)
13. [Assumptions & Design Decisions](#assumptions--design-decisions)
14. [Q1 Self-Review Checklist](#q1-self-review-checklist)

---

## Project Overview

ShelfLife streamlines college library workflows by providing librarians with secure, transactional endpoints to manage inventory, catalog members, and issue/return books.

Key capabilities include:
- **Librarian Authentication**: Secure JWT-based access with bcrypt password hashing.
- **Inventory Control**: Books with unique ISBN indexing, genre taxonomy, and constraints (`availableCopies <= totalCopies`).
- **Member Management**: Registration with unique email and `membershipId` indexing.
- **Concurrency-Safe Issuing**: Atomic operations preventing race conditions when issuing the last available copy.
- **Automated Overdue Detection**: Identifies overdue records dynamically upon history lookup and synchronizes persistence.
- **Zero-Setup Embedded Database Fallback**: Built-in `MongoMemoryServer` fallback ensures the application runs out of the box even if a local MongoDB service is not pre-installed.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** (v18+) | JavaScript runtime engine |
| **Express.js** (v4.x) | Web framework for routing and middleware |
| **MongoDB & Mongoose** (v8.x) | NoSQL document database and Object Data Modeling (ODM) |
| **JSON Web Tokens (jsonwebtoken)** | Stateless authentication for librarian access |
| **bcryptjs** | Salted hashing for librarian credentials |
| **Joi** | Request payload schema validation |
| **CORS** | Cross-Origin Resource Sharing enabling future React frontend integration |
| **mongodb-memory-server** | In-memory MongoDB for automated testing and zero-setup evaluation |

---

## Folder Structure

The project follows the recommended modular architecture:

```
shelflife-backend/
│
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & embedded fallback
│   │
│   ├── models/
│   │   ├── Book.js               # Book Mongoose schema with ISBN index
│   │   ├── Member.js             # Member schema with email & membershipId index
│   │   ├── BorrowRecord.js       # BorrowRecord schema with refs & query indexes
│   │   └── User.js               # Librarian user schema with bcrypt hashing
│   │
│   ├── controllers/
│   │   ├── authController.js     # Login & JWT token issuance
│   │   ├── bookController.js     # Book creation, listing, pagination, filtering
│   │   ├── memberController.js   # Member creation & history with overdue check
│   │   └── borrowController.js   # Concurrency-safe issue & return operations
│   │
│   ├── routes/
│   │   ├── authRoutes.js         # Routes for /api/auth
│   │   ├── bookRoutes.js         # Routes for /api/books
│   │   ├── memberRoutes.js       # Routes for /api/members
│   │   └── borrowRoutes.js       # Routes for /api/borrow and /api/return
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js     # Bearer token verification & librarian role check
│   │   ├── errorMiddleware.js    # Centralized error handler & AppError class
│   │   ├── loggerMiddleware.js   # Request logger: method, URL, status, duration
│   │   └── validationMiddleware.js# Joi validation middleware generator
│   │
│   ├── validators/
│   │   ├── authValidator.js      # Login schema validation
│   │   ├── bookValidator.js      # Book creation & query schemas
│   │   ├── memberValidator.js    # Member registration & ID schemas
│   │   └── borrowValidator.js    # Borrow & return request schemas
│   │
│   ├── scripts/
│   │   └── seed.js               # Database seeding script with sample records
│   │
│   ├── app.js                    # Express app setup, CORS, routes & error handling
│   └── server.js                 # Server entry point & graceful shutdown
│
├── tests/
│   └── testRunner.js             # Comprehensive 43-assertion automated test suite
│
├── .env                          # Local environment variables
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies and execution scripts
└── README.md                     # Complete project documentation
```

---

## Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Optional: local service or MongoDB Atlas; if absent, an embedded in-memory MongoDB will automatically start for zero-setup execution).

### Steps
1. Open your terminal and navigate to the project directory:
   ```bash
   cd shelflife-backend
   ```
2. Install all required dependencies:
   ```bash
   npm install
   ```

---

## Environment Variables

Copy `.env.example` to `.env` or verify the configuration:

```bash
cp .env.example .env
```

| Variable | Description | Default Value |
|---|---|---|
| `PORT` | Port for the Express server | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/shelflife` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `shelflife_super_secret_jwt_key_2026` |
| `NODE_ENV` | Application environment (`development` / `production` / `test`) | `development` |
| `USE_MEMORY_DB`| Set to `true` to force embedded in-memory database | `false` |

---

## MongoDB Setup & Reliability

1. **Standard MongoDB Setup**:
   If a local MongoDB daemon or MongoDB Atlas instance is accessible at `MONGODB_URI`, the application connects to it directly.
2. **Zero-Setup Embedded Fallback**:
   If the local MongoDB daemon is not running on port 27017, `src/config/db.js` automatically starts an embedded `MongoMemoryServer`. This ensures the project runs reliably without requiring manual service installation on Windows or macOS.

---

## Running the Application

### Start in Production / Normal Mode:
```bash
npm start
```

### Start in Development Mode (with hot-reload):
```bash
npm run dev
```

The server will display:
```
===============================================
 ShelfLife Backend API is running on port 5000
 Environment: development
 Health check: http://localhost:5000/health
===============================================
```

---

## Database Seeding

To populate the database with a default librarian, books across multiple genres, registered members, and sample borrowing records (including an active loan and an overdue loan):

```bash
npm run seed
```

### Seeded Librarian Credentials:
- **Email:** `librarian@shelflife.edu`
- **Password:** `password123`
- **Role:** `librarian`

---

## Automated Testing

The project includes an end-to-end automated test runner (`tests/testRunner.js`) testing all requirements:

```bash
npm test
```

### Verified Test Categories (43 Assertions Passed):
1. **Health Check**: `GET /health` returns 200.
2. **Authentication**: Rejection of bad credentials (401), valid login returns token (200).
3. **Route Protection**: Missing token (401), tampered/invalid JWT (401).
4. **Book Validation**: `availableCopies > totalCopies` rejected (400), valid creation (201), duplicate ISBN rejected (409).
5. **Listing & Filtering**: Public read access (200), pagination metadata (`page`, `limit`, `total`, `totalPages`), genre filtering.
6. **Member Operations**: Email format validation (400), valid registration (201), duplicate email (409), duplicate membershipId (409).
7. **Issuing Books**: Safe decrement of `availableCopies` (201).
8. **Race Condition Test**: Two simultaneous requests for the last copy; exactly one succeeds and one is rejected safely. Zero-copy rejection (400).
9. **History & Overdue**: Populated book details, automated detection and synchronization of overdue status.
10. **Return Processing**: Safe increment of `availableCopies`, duplicate return rejection (400), URL param and body return routes.

---

## Authentication & Authorization

All write and management operations require librarian credentials:
- **Protected Routes**:
  - `POST /api/books`
  - `POST /api/members`
  - `POST /api/borrow`
  - `POST /api/return` & `POST /api/return/:borrowId`
  - `GET /api/members/:memberId/history`
- **Public Routes**:
  - `GET /health`
  - `POST /api/auth/login`
  - `GET /api/books`

### Providing Credentials:
Include the Bearer token in the HTTP `Authorization` header:
```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

---

## Race Condition Prevention (4–6 Line Dedicated Answer)

<!-- DEDICATED EXAM ANSWER (4-6 LINES) -->
```text
To prevent two librarians from issuing the last copy of the same book simultaneously, we execute
MongoDB's atomic findOneAndUpdate with the condition { availableCopies: { $gt: 0 } } and mutation
{ $inc: { availableCopies: -1 } }. Because MongoDB serializes write operations on a single document
atomically, exactly one request decrements the final copy, while concurrent requests match 0 documents,
receive null, and are safely rejected without phantom loans. In multi-node replica set environments,
a Mongoose transaction further guarantees ACID atomicity between the Book update and BorrowRecord creation.
```

---

## API Documentation & cURL Examples

### 1. Health Check
- **Endpoint:** `GET /health`
- **Access:** Public
- **Response:**
  ```json
  {
    "success": true,
    "message": "ShelfLife API is running"
  }
  ```
- **cURL:**
  ```bash
  curl -X GET http://localhost:5000/health
  ```

---

### 2. Librarian Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "librarian@shelflife.edu",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67010a1b2c3d4e5f6a7b8c9d",
      "email": "librarian@shelflife.edu",
      "role": "librarian"
    }
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "librarian@shelflife.edu", "password": "password123"}'
  ```

---

### 3. Add a New Book
- **Endpoint:** `POST /api/books`
- **Access:** Protected (Librarian only)
- **Request Body:**
  ```json
  {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "ISBN": "9780132350884",
    "genre": "Programming",
    "totalCopies": 5,
    "availableCopies": 5
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "67010a1b2c3d4e5f6a7b8c9e",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "ISBN": "9780132350884",
      "genre": "Programming",
      "totalCopies": 5,
      "availableCopies": 5,
      "createdAt": "2026-10-05T10:50:00.000Z",
      "updatedAt": "2026-10-05T10:50:00.000Z"
    }
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:5000/api/books \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -d '{
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "ISBN": "9780132350884",
      "genre": "Programming",
      "totalCopies": 5,
      "availableCopies": 5
    }'
  ```

---

### 4. List Books (Pagination & Filtering)
- **Endpoint:** `GET /api/books?page=1&limit=10&genre=Programming`
- **Access:** Public
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10, max: 100)
  - `genre` (optional, case-insensitive exact filter)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "67010a1b2c3d4e5f6a7b8c9e",
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "ISBN": "9780132350884",
        "genre": "Programming",
        "totalCopies": 5,
        "availableCopies": 4
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
  ```
- **cURL:**
  ```bash
  curl -X GET "http://localhost:5000/api/books?page=1&limit=10&genre=Programming"
  ```

---

### 5. Register a New Member
- **Endpoint:** `POST /api/members`
- **Access:** Protected (Librarian only)
- **Request Body:**
  ```json
  {
    "name": "Alice Smith",
    "email": "alice.smith@university.edu",
    "membershipId": "MEM-2026-001"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "67010a1b2c3d4e5f6a7b8ca1",
      "name": "Alice Smith",
      "email": "alice.smith@university.edu",
      "membershipId": "MEM-2026-001",
      "joinedDate": "2026-10-05T10:50:00.000Z",
      "createdAt": "2026-10-05T10:50:00.000Z",
      "updatedAt": "2026-10-05T10:50:00.000Z"
    }
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:5000/api/members \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -d '{
      "name": "Alice Smith",
      "email": "alice.smith@university.edu",
      "membershipId": "MEM-2026-001"
    }'
  ```

---

### 6. Issue a Book
- **Endpoint:** `POST /api/borrow`
- **Access:** Protected (Librarian only)
- **Request Body:**
  ```json
  {
    "bookId": "67010a1b2c3d4e5f6a7b8c9e",
    "memberId": "67010a1b2c3d4e5f6a7b8ca1",
    "dueDate": "2026-11-01"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "67010a1b2c3d4e5f6a7b8cb2",
      "book": {
        "_id": "67010a1b2c3d4e5f6a7b8c9e",
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "ISBN": "9780132350884",
        "genre": "Programming"
      },
      "member": {
        "_id": "67010a1b2c3d4e5f6a7b8ca1",
        "name": "Alice Smith",
        "email": "alice.smith@university.edu",
        "membershipId": "MEM-2026-001"
      },
      "issueDate": "2026-10-05T10:50:00.000Z",
      "dueDate": "2026-11-01T00:00:00.000Z",
      "returnDate": null,
      "status": "issued"
    }
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:5000/api/borrow \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -d '{
      "bookId": "67010a1b2c3d4e5f6a7b8c9e",
      "memberId": "67010a1b2c3d4e5f6a7b8ca1",
      "dueDate": "2026-11-01"
    }'
  ```

---

### 7. Return a Book
- **Endpoint:** `POST /api/return` (or `POST /api/return/:borrowId`)
- **Access:** Protected (Librarian only)
- **Request Body (if using `/api/return`):**
  ```json
  {
    "borrowId": "67010a1b2c3d4e5f6a7b8cb2"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "67010a1b2c3d4e5f6a7b8cb2",
      "book": {
        "_id": "67010a1b2c3d4e5f6a7b8c9e",
        "title": "Clean Code",
        "totalCopies": 5,
        "availableCopies": 5
      },
      "member": {
        "_id": "67010a1b2c3d4e5f6a7b8ca1",
        "name": "Alice Smith",
        "membershipId": "MEM-2026-001"
      },
      "issueDate": "2026-10-05T10:50:00.000Z",
      "dueDate": "2026-11-01T00:00:00.000Z",
      "returnDate": "2026-10-05T10:55:00.000Z",
      "status": "returned"
    }
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:5000/api/return \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -d '{"borrowId": "67010a1b2c3d4e5f6a7b8cb2"}'
  ```

---

### 8. Member Borrowing History & Overdue Handling
- **Endpoint:** `GET /api/members/:memberId/history`
- **Access:** Protected (Librarian operation)
- **Description:** Returns all borrowing records for a member sorted by `issueDate` descending. Unreturned records whose `dueDate` has passed are dynamically synchronized to `"overdue"` status.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "67010a1b2c3d4e5f6a7b8cb2",
        "book": {
          "_id": "67010a1b2c3d4e5f6a7b8c9e",
          "title": "Clean Code",
          "author": "Robert C. Martin",
          "ISBN": "9780132350884",
          "genre": "Programming"
        },
        "member": "67010a1b2c3d4e5f6a7b8ca1",
        "issueDate": "2026-10-05T10:50:00.000Z",
        "dueDate": "2026-11-01T00:00:00.000Z",
        "returnDate": "2026-10-05T10:55:00.000Z",
        "status": "returned"
      },
      {
        "_id": "67010a1b2c3d4e5f6a7b8cc3",
        "book": {
          "_id": "67010a1b2c3d4e5f6a7b8c9f",
          "title": "Introduction to Algorithms",
          "author": "Thomas H. Cormen",
          "ISBN": "9780262033848",
          "genre": "Computer Science"
        },
        "member": "67010a1b2c3d4e5f6a7b8ca1",
        "issueDate": "2026-09-01T00:00:00.000Z",
        "dueDate": "2026-09-15T00:00:00.000Z",
        "returnDate": null,
        "status": "overdue"
      }
    ]
  }
  ```
- **cURL:**
  ```bash
  curl -X GET http://localhost:5000/api/members/67010a1b2c3d4e5f6a7b8ca1/history \
    -H "Authorization: Bearer <JWT_TOKEN>"
  ```

---

## Assumptions & Design Decisions

1. **Overdue Status Synchronization**:
   We choose to update the database status during retrieval (`status: 'issued'` -> `'overdue'`) using `BorrowRecord.updateMany`. This ensures persistent consistency so that subsequent queries, administrative reports, and the upcoming Q2 React frontend always view synchronized data.
2. **Transaction Strategy & Deployment Adaptability**:
   MongoDB multi-document transactions require a Replica Set. In single-instance standalone deployments, MongoDB drivers reject transactions. Our `borrowController` inspects cluster topology via `canUseTransactions()`:
   - When a Replica Set is active (e.g. MongoDB Atlas / production clusters), operations run inside an ACID transaction session.
   - In standalone local modes, operations use atomic conditional updates (`{ availableCopies: { $gt: 0 } }`) paired with an automated compensating rollback if record creation encounters an error.
3. **Borrow Route Flexibility**:
   The return endpoint is mounted to handle both `POST /api/return` (with `{ "borrowId": "..." }` in request body) and `POST /api/return/:borrowId` (with ID in URL path), providing maximum client flexibility.
4. **Member History Route Protection**:
   `GET /api/members/:memberId/history` is protected under librarian authentication to prevent unauthorized inspection of student borrowing histories.

---

## Q1 Self-Review Checklist

- [x] Book schema complete
- [x] Member schema complete
- [x] BorrowRecord schema complete
- [x] Unique ISBN
- [x] Unique email
- [x] References configured
- [x] POST /api/books
- [x] GET /api/books
- [x] Pagination
- [x] Genre filtering
- [x] POST /api/members
- [x] POST /api/borrow
- [x] availableCopies check
- [x] Atomic/concurrency-safe decrement
- [x] POST /api/return/
- [x] Safe increment
- [x] Member history
- [x] Overdue handling
- [x] Request logger
- [x] Centralized error handler
- [x] Input validation
- [x] JWT login
- [x] Authentication middleware
- [x] Protected librarian routes
- [x] Race-condition explanation
- [x] README
- [x] Sample curl requests
- [x] Environment configuration
