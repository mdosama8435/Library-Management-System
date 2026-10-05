# ShelfLife — College Library Management System
> **Full Stack Web Development IA2 Examination Project**

ShelfLife is a full-stack library management system designed for college librarians to catalog books, enroll members, lend materials with concurrency-safe stock decrementing, track loans with automated overdue calculation, and manage returns.

---

## Workspace Structure

- [`shelflife-backend/`](file:///d:/Sem4_project/shelflife-backend) — **Question 1 Implementation**
  - Node.js + Express + MongoDB/Mongoose REST API.
  - JWT librarian authentication & bcrypt password hashing.
  - Concurrency-safe atomic `$inc: { availableCopies: -1 }` decrement.
  - Comprehensive 43-assertion automated test suite (`npm test`).
  - Embedded `MongoMemoryServer` fallback for zero-configuration execution.
  - Port: `http://localhost:5000`

- [`shelflife-frontend/`](file:///d:/Sem4_project/shelflife-frontend) — **Question 2 Implementation**
  - React 19 + TypeScript + Vite + React Router 7 + Tailwind CSS.
  - Reusable generic `<DataTable<T>>` component.
  - Client-side `<ProtectedRoute>` and `AuthContext` session management.
  - Books Catalog with real-time title search, genre dropdown, and pagination.
  - Book issuance form with zero-stock disabled state and toast feedback.
  - Member history with prominent `[ OVERDUE ]` badges and return actions.
  - Port: `http://localhost:5173`

- [`docs/system-design/`](file:///d:/Sem4_project/docs/system-design) — **Question 3 Implementation**
  - University-scale system design specification (500 campuses, 2M members, 10x semester traffic spike).
  - High-level multi-tier architecture specification & Mermaid architecture diagram.
  - MongoDB scaling & compound sharding analysis (`campusId` affinity).
  - Redis cache-aside read offloading for catalog queries (`GET /api/books`).
  - Strict concurrency safety analysis for book issuance (`findOneAndUpdate` + ACID transactions).
  - Horizontal elasticity (HPA) and failure resilience design.

---

## Quick Start Instructions

### 1. Start the Backend API (Port 5000)
```bash
cd d:\Sem4_project\shelflife-backend
npm install
npm start
```
*Auto-seeds initial librarian credentials (`librarian@shelflife.edu` / `password123`), 5 books, and 3 members.*

### 2. Start the Frontend App (Port 5173)
```bash
cd d:\Sem4_project\shelflife-frontend
npm install
npm run dev
```

Open your browser at **`http://localhost:5173`**.
