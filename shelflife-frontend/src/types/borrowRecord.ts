import type { Book } from './book';
import type { Member } from './member';

export type BorrowStatus = 'issued' | 'returned' | 'overdue';

export interface BorrowRecord {
  _id: string;
  book: Book;
  member: string | Member;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: BorrowStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface IssueBookRequest {
  bookId: string;
  memberId: string;
  dueDate: string;
}

export interface ReturnBookRequest {
  borrowId: string;
}
