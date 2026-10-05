# ShelfLife Frontend — College Library Management System
> **Full Stack Web Development IA2 — Question 2 React + TypeScript Frontend**

ShelfLife Frontend is a responsive single-page web application built with **React 19**, **TypeScript**, **Vite**, **React Router 7**, and **Tailwind CSS**. It communicates directly with the Question 1 Express + MongoDB backend running on `http://localhost:5000`.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Key Features](#key-features)
4. [Folder Structure](#folder-structure)
5. [Installation & Setup](#installation--setup)
6. [Environment Variables](#environment-variables)
7. [Running the Application](#running-the-application)
8. [Backend Integration Details](#backend-integration-details)
9. [Authentication & Route Protection](#authentication--route-protection)
10. [State Management Architecture & Note](#state-management-architecture--note)
11. [Generic Reusable Component (`<DataTable<T>>`)](#generic-reusable-component-datatablet)
12. [Available Routes](#available-routes)
13. [Assumptions](#assumptions)
14. [Q2 Verification Checklist](#q2-verification-checklist)

---

## Project Overview

The ShelfLife Frontend empowers college librarians to manage book catalogs, register members, issue book loans with real-time stock verification, inspect member loan history with automated overdue tracking, and process book returns.

### Core URLs
- **Backend API:** `http://localhost:5000`
- **Frontend App:** `http://localhost:5173`

---

## Technologies Used

| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI library |
| **TypeScript** | Strict type safety and robust data contracts |
| **Vite** | Next-generation frontend tooling and bundler |
| **React Router 7** | Client-side routing with protected route guards |
| **Tailwind CSS 3** | Utility-first responsive styling and curated color tokens |
| **Axios** | Typed HTTP client with centralized interceptors |
| **Lucide React** | Lightweight modern icon set |

---

## Key Features

1. **Librarian Authentication**:
   - Secure login portal with email and password validation.
   - Examination convenience: pre-filled default credentials (`librarian@shelflife.edu` / `password123`).
   - JWT stored in `localStorage` and automatically injected via Axios request interceptors.
   - Client-side route protection redirecting unauthenticated users to `/login`.
   - Centralized logout clearing tokens and redirecting to the login portal.

2. **Books Catalog (`/books`)**:
   - Consumes `GET /api/books?page=X&limit=Y&genre=Z`.
   - **Title Search**: Case-insensitive instant filtering on the fetched page data without violating backend contracts.
   - **Genre Filter**: Backend-queried dropdown filtering books by genre.
   - **Pagination**: Next, Previous, and Page metadata (`Page 1 of 1`, total books count) consuming backend pagination metadata.
   - **Stock Badges**: Real-time availability indicator (`Available (X left)` in green, `Out of Stock` in red).
   - **Librarian Add Book**: Modal form supporting `POST /api/books`.

3. **Issue Book (`/issue-book`)**:
   - Member dropdown displaying `Member Name (Membership ID)`.
   - Book dropdown showing `Book Title by Author [X available]`.
   - Zero-copy protection: Books with `availableCopies === 0` are disabled and marked `No copies available`.
   - Due date picker with a minimum boundary set to tomorrow and default to 14 days ahead.
   - Submit button disables during request processing to prevent accidental double-submits.
   - Success toast and automatic catalog stock refresh on completion.

4. **Member Directory (`/members`)**:
   - Member list powered by the generic `<DataTable<Member>>`.
   - Columns: Name, Email, Membership ID badge, Joined Date, and "View History" button.
   - Add Member modal for `POST /api/members`.

5. **Member History & Overdue Detection (`/members/:memberId/history`)**:
   - Detailed header card with total loans, active loans, overdue count, and returned count.
   - Consumes `GET /api/members/:memberId/history` with populated Book details.
   - **Overdue Recognition**: Visually distinct crimson badge **`[ OVERDUE ]`** with alert icon rendered if `dueDate < today` and loan has not been returned.
   - **Active Loans**: Blue `[ ACTIVE LOAN ]` badge.
   - **Returned Loans**: Emerald `[ RETURNED ]` badge (returned loans are never marked overdue).
   - **Return Book Action**: Integrated "Return Book" button calling `POST /api/return/:borrowId`, restoring available copies and refreshing history.

6. **Toast Notification System**:
   - Reusable notification provider with animated, auto-dismissing toasts for success, error, and operational feedback.

---

## Folder Structure

```
shelflife-frontend/
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── DataTable.tsx        # Genuinely generic reusable table (<DataTable<T>>)
│   │   │   ├── LoadingSpinner.tsx   # Reusable loading indicator
│   │   │   ├── ErrorMessage.tsx     # Reusable error card with retry button
│   │   │   └── EmptyState.tsx       # Reusable empty data illustration
│   │   │
│   │   └── layout/
│   │       ├── Layout.tsx           # Shell layout managing Navbar and Sidebar
│   │       ├── Navbar.tsx           # Top navigation with librarian profile & logout
│   │       └── Sidebar.tsx          # Responsive navigation links & drawer
│   │
│   ├── context/
│   │   ├── AuthContext.tsx          # Authentication provider and useAuth hook
│   │   └── ToastContext.tsx         # Toast notification provider and useToast hook
│   │
│   ├── pages/
│   │   ├── Login.tsx                # Librarian sign-in page
│   │   ├── Books.tsx                # Books catalog with search, filter, pagination
│   │   ├── IssueBook.tsx            # Loan issuance form with stock guards
│   │   ├── Members.tsx              # Member directory
│   │   └── MemberHistory.tsx        # Member loan history with overdue badges & return
│   │
│   ├── routes/
│   │   └── ProtectedRoute.tsx       # Route guard redirecting to /login if unauthenticated
│   │
│   ├── services/
│   │   ├── api.ts                   # Central Axios instance with JWT interceptors
│   │   ├── authService.ts           # Login and logout service calls
│   │   ├── bookService.ts           # Query and create book service calls
│   │   ├── memberService.ts         # Members list, create, and history service calls
│   │   └── borrowService.ts         # Issue and return book service calls
│   │
│   ├── types/
│   │   ├── auth.ts                  # User, LoginRequest, LoginResponse, AuthContextType
│   │   ├── book.ts                  # Book, CreateBookRequest, BookQuery
│   │   ├── member.ts                # Member, CreateMemberRequest
│   │   ├── borrowRecord.ts          # BorrowRecord, IssueBookRequest, ReturnBookRequest
│   │   └── common.ts                # ApiResponse, PaginatedResponse, PaginationMeta
│   │
│   ├── App.tsx                      # Application router and provider tree
│   ├── main.tsx                     # React 19 root mounting
│   └── index.css                    # Tailwind CSS directives and custom scrollbars
│
├── .env                             # Frontend environment configuration
├── .env.example                     # Environment template
├── index.html                       # HTML entry point with metadata and favicon
├── package.json                     # Dependencies and scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind CSS theme extension
├── tsconfig.json                    # Root TypeScript configuration
├── tsconfig.app.json                # Application TypeScript compiler settings
└── vite.config.ts                   # Vite configuration
```

---

## Installation & Setup

1. Navigate to the frontend directory:
   ```bash
   cd d:\Sem4_project\shelflife-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Environment Variables

The frontend connects to the backend through `VITE_API_BASE_URL`.

Create or verify `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## Running the Application

Ensure the Q1 backend is running on `http://localhost:5000` (e.g. `npm start` in `shelflife-backend`).

Then start the frontend development server:
```bash
npm run dev
```

Open your browser at:
```
http://localhost:5173
```

To build for production:
```bash
npm run build
```

---

## Backend Integration Details

All endpoints correspond to the Question 1 Express backend contracts:

| Feature | HTTP Method | Endpoint | Auth Required | Request Payload | Response Data |
|---|---|---|---|---|---|
| **Login** | `POST` | `/api/auth/login` | No | `{ email, password }` | `{ success: true, token, user }` |
| **List Books** | `GET` | `/api/books?page=1&limit=10&genre=...` | No | None | `{ success: true, data: Book[], pagination }` |
| **Add Book** | `POST` | `/api/books` | Yes (`Bearer <token>`) | `{ title, author, ISBN, genre, totalCopies, availableCopies }` | `{ success: true, data: Book }` |
| **List Members** | `GET` | `/api/members` | Yes (`Bearer <token>`) | None | `{ success: true, data: Member[] }` |
| **Add Member** | `POST` | `/api/members` | Yes (`Bearer <token>`) | `{ name, email, membershipId }` | `{ success: true, data: Member }` |
| **Issue Book** | `POST` | `/api/borrow` | Yes (`Bearer <token>`) | `{ bookId, memberId, dueDate }` | `{ success: true, data: BorrowRecord }` |
| **Return Book** | `POST` | `/api/return/:borrowId` | Yes (`Bearer <token>`) | None | `{ success: true, data: BorrowRecord }` |
| **Member History** | `GET` | `/api/members/:memberId/history` | Yes (`Bearer <token>`) | None | `{ success: true, data: BorrowRecord[] }` |

---

## Authentication & Route Protection

1. **Stateless JWT Flow**:
   On successful login, the server returns a JWT containing `{ id, email, role: 'librarian' }`. The token is stored in `localStorage` under key `shelflife_token`.
2. **Axios Interceptor**:
   In `src/services/api.ts`, a request interceptor automatically attaches `Authorization: Bearer <token>` to all outgoing requests.
3. **Automatic 401 Expiration Handling**:
   If an expired or invalid token is received, the response interceptor purges the token from `localStorage` and redirects the user to `/login`.
4. **Client-Side Guard (`<ProtectedRoute />`)**:
   Ensures that `/books`, `/issue-book`, `/members`, and `/members/:memberId/history` cannot be rendered unless `isAuthenticated === true`.

---

## State Management Architecture & Note

> ### Academic Note on State Management Decision
> For the ShelfLife Library Management System, state management is structured into two intentional layers:
> 1. **Global Cross-Cutting Authentication State (`AuthContext`)**:
>    Authentication status (`token`, `user`, `isAuthenticated`) is required globally across all pages, layouts, and route guards. React Context with a lightweight custom hook (`useAuth()`) provides a single source of truth and seamlessly synchronizes with `localStorage` without overhead.
> 2. **Page-Local Data State (`useState` + `useEffect`)**:
>    Catalog queries, pagination metadata, search inputs, active loan records, and modal toggle flags are page-specific. Encapsulating this data within their respective page components (`Books.tsx`, `IssueBook.tsx`, `MemberHistory.tsx`) ensures clean garbage collection on unmount, eliminates unnecessary re-renders across sibling routes, and avoids state synchronization bugs.
> 3. **Why External Global State Stores (e.g., Redux / Zustand) Are Unnecessary**:
>    ShelfLife is a focused management tool where business mutations (issuing a book, returning a book) immediately sync with the server database. Introducing Redux would add extensive boilerplate (actions, reducers, dispatchers, store configuration) with zero architectural gain. React Context for session management combined with local component state for UI views represents the cleanest, most maintainable, and standard pattern for this application scope.

---

## Generic Reusable Component (`<DataTable<T>>`)

To fulfill the examination requirement for a genuinely generic reusable component, [`DataTable.tsx`](file:///d:/Sem4_project/shelflife-frontend/src/components/common/DataTable.tsx) was implemented using TypeScript generics:

```typescript
export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  keyExtractor?: (item: T, index: number) => string;
  className?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  loading = false,
  emptyMessage,
  emptyTitle,
  keyExtractor,
  className = '',
}: DataTableProps<T>): React.ReactElement {
  // Handles loading state, empty state, and typed column rendering
}
```

### Demonstration of Generic Reuse:
1. In `Books.tsx`: Renders `<DataTable<Book> data={books} columns={bookColumns} />`.
2. In `Members.tsx`: Renders `<DataTable<Member> data={members} columns={memberColumns} />`.
3. In `MemberHistory.tsx`: Renders `<DataTable<BorrowRecord> data={history} columns={historyColumns} />`.

---

## Available Routes

- `/login` — Librarian sign-in portal.
- `/books` — Main inventory catalog with title search, genre dropdown, and pagination.
- `/issue-book` — Member & Book lending form with zero-stock protection.
- `/members` — Registered member directory.
- `/members/:memberId/history` — Full loan history with overdue badges and return actions.
- `*` — Fallback redirecting to `/books`.

---

## Assumptions

1. **Title Search Execution**: Because the Q1 backend provides genre filtering and pagination, title search is executed on the frontend within the fetched page dataset, fulfilling the Q2 requirement without altering the backend query parameters.
2. **Member Listing Route**: To support the member dropdown on `/issue-book` and enable directory navigation on `/members`, `GET /api/members` was exposed on the backend as an authenticated librarian operation.
3. **Overdue Representation**: If a loan's `dueDate` is earlier than today and `returnDate` is null, the frontend immediately flags the item with the prominent `[ OVERDUE ]` badge, adhering strictly to the overdue logic specified in the exam.
4. **Return Processing**: Returning a book calls `POST /api/return/:borrowId`, which increments `availableCopies` in MongoDB and marks the record returned.

---

## Q2 Verification Checklist

### Q2(a) Type Definitions & API Client
- [x] TypeScript `Book` interface
- [x] TypeScript `Member` interface
- [x] TypeScript `BorrowRecord` interface
- [x] Typed API client (`src/services/api.ts`)
- [x] Proper request typing
- [x] Proper response typing

### Q2(b) Books Catalog
- [x] Book List page (`/books`)
- [x] Books displayed with title, author, ISBN, genre, total & available copies
- [x] Title search with real-time case-insensitive filter
- [x] Genre dropdown triggering backend query (`GET /api/books?genre=...`)
- [x] `useState` / `useEffect` page state management
- [x] Loading state (`LoadingSpinner`)
- [x] Error state with retry (`ErrorMessage`)
- [x] Pagination controls (`Previous`, `Next`, `Page X of Y`, total count)

### Q2(c) Issue Book
- [x] Issue Book page (`/issue-book`)
- [x] Member selector displaying name and ID
- [x] Book selector displaying title, author, and available copies
- [x] Zero-copy protection (books with `availableCopies === 0` disabled)
- [x] Due date picker with future date validation
- [x] Calls `POST /api/borrow`
- [x] Success toast notification
- [x] Error toast notification with backend error message
- [x] Submit button disabled while request is in flight

### Q2(d) Member History & Overdue Badges
- [x] Member History page (`/members/:memberId/history`)
- [x] `BorrowRecord` list with populated Book information
- [x] Issue date, due date, return date, and status columns
- [x] Visually distinct crimson `[ OVERDUE ]` badge for past unreturned loans
- [x] Returned records are never marked overdue
- [x] Integrated "Return Book" action with status refresh

### Q2(e) Generic Component
- [x] Generic reusable `<DataTable<T>>` component
- [x] Implemented using strict TypeScript generics (`<T extends object>`)
- [x] Reused across 3 distinct data types: `Book`, `Member`, and `BorrowRecord`

### Q2(f) Routing & Session
- [x] React Router 7 setup
- [x] `<ProtectedRoute>` guarding authenticated routes
- [x] Unauthenticated users redirected to `/login`
- [x] Working Logout button clearing token and session
- [x] Complete README with state-management documentation
