# ShelfLife — Question 3: System Design Documentation

This directory contains the complete architectural specification and system design artifacts for **Question 3 (10 Marks)** of the Full Stack Web Development IA2 Examination.

---

## 1. Exam Requirement Mapping (Q3 a–e)

The system design directly and rigorously addresses each sub-question of the exam:

| Exam Question | Requirement | Primary Artifact Section | Architectural Solution |
| :--- | :--- | :--- | :--- |
| **Q3 (a)** | High-Level Architecture (Client, API, DB, Cache, Load Balancer, Queue, CDN) | [Section 2](file:///d:/Sem4_project/docs/system-design/shelf-life-system-design.md#2-high-level-architecture-exam-sub-question-a) & [`shelf-life-architecture.mmd`](file:///d:/Sem4_project/docs/system-design/shelf-life-architecture.mmd) | Multi-tiered architecture: React SPA -> Global CDN -> Dual ALB -> Stateless Express Cluster (HPA) -> Redis Cluster (Cache-aside) + RabbitMQ (Async side-effects) -> Sharded MongoDB Cluster. |
| **Q3 (b)** | Single Cluster vs. Sharding; Propose & Justify Shard Keys for `Book` and `BorrowRecord` | [Section 3](file:///d:/Sem4_project/docs/system-design/shelf-life-system-design.md#3-mongodb-scaling--sharding-strategy-exam-sub-question-b) | **Shard Decision**: Sharding chosen due to single-primary write bottlenecks under 500 simultaneous campuses.<br/>**Shard Keys**:<br/>- `Book`: `{ campusId: 1, _id: 1 }`<br/>- `BorrowRecord`: `{ campusId: 1, member: 1 }`<br/>**Justification**: Targets 99% of campus queries to a single shard (no scatter-gather) while compound suffix prevents jumbo chunks. |
| **Q3 (c)** | Single Most Read-Heavy Operation, Cached Data, Invalidation Triggers, TTL | [Section 4](file:///d:/Sem4_project/docs/system-design/shelf-life-system-design.md#4-read-heavy-operation--redis-caching-exam-sub-question-c) | **Operation**: `GET /api/books` (catalog search & genre filtering).<br/>**Key**: `books:{campusId}:{page}:{limit}:{genre}:{searchHash}`.<br/>**TTL**: 60 seconds.<br/>**Invalidation**: On catalog mutations (`POST /api/books`) and issue/return events; cached count is strictly a UI display hint. |
| **Q3 (d)** | Invariant `availableCopies >= 0` under Concurrency; Choose ONE mechanism & Compare | [Section 5](file:///d:/Sem4_project/docs/system-design/shelf-life-system-design.md#5-concurrent-issue-book-consistency-exam-sub-question-d) | **Chosen Mechanism**: **Atomic Conditional Update** (`findOneAndUpdate` with `{ availableCopies: { $gt: 0 } }` and `{ $inc: { availableCopies: -1 } }`) inside a multi-document session transaction.<br/>**Superiority**: Prevents optimistic locking abort storms, avoids distributed lock (Redlock) split-brain/network overhead, and eliminates asynchronous queue checkout ambiguity. |
| **Q3 (e)** | Handling 10× Semester Spike Without Year-Round Over-Provisioning | [Section 6](file:///d:/Sem4_project/docs/system-design/shelf-life-system-design.md#6-handling-10-semester-traffic-spike-exam-sub-question-e) | Dynamic elastic horizontal autoscaling (HPA 10 -> 80 pods), aggressive in-memory caching via Redis (absorbing 90% of catalog search reads), secondary replica offloading (`readPreference: 'secondaryPreferred'`), and asynchronous queuing for non-critical side effects. |

---

## 2. Directory Artifacts

1. **[`shelf-life-system-design.md`](file:///d:/Sem4_project/docs/system-design/shelf-life-system-design.md)**:
   - Full 1–2 page engineering specification written in formal academic style.
   - Contains explicit scale assumptions, architecture breakdown, sharding evaluation, concurrency mathematical justification, spike mitigation, failure resilience analysis, and trade-off tables.
2. **[`shelf-life-architecture.mmd`](file:///d:/Sem4_project/docs/system-design/shelf-life-architecture.mmd)**:
   - Standalone valid Mermaid diagram file visualizing the end-to-end multi-tier architecture with labeled Read, Write, Cache, Transactional, and Asynchronous paths.

---

## 3. Consistency with Existing ShelfLife Codebase

The system design document is built directly upon the existing implementation:

- **Backend Alignment** ([`shelflife-backend/`](file:///d:/Sem4_project/shelflife-backend)):
  - Preserves the Node.js + Express.js modular monolith architecture.
  - Matches the existing data models in [`Book.js`](file:///d:/Sem4_project/shelflife-backend/src/models/Book.js), [`BorrowRecord.js`](file:///d:/Sem4_project/shelflife-backend/src/models/BorrowRecord.js), and [`Member.js`](file:///d:/Sem4_project/shelflife-backend/src/models/Member.js).
  - Directly reflects the atomic conditional update and transaction logic already implemented in [`borrowController.js`](file:///d:/Sem4_project/shelflife-backend/src/controllers/borrowController.js).
- **Frontend Alignment** ([`shelflife-frontend/`](file:///d:/Sem4_project/shelflife-frontend)):
  - Preserves the React 19 + TypeScript SPA architecture, Vite bundling, and Axios client service layers.
  - Leverages CDN edge distribution for static bundles without requiring frontend state modifications.
