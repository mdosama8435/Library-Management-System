import api from './api';
import type { BorrowRecord, IssueBookRequest } from '../types/borrowRecord';
import type { ApiResponse } from '../types/common';

export const issueBook = async (issueData: IssueBookRequest): Promise<ApiResponse<BorrowRecord>> => {
  const response = await api.post<ApiResponse<BorrowRecord>>('/api/borrow', issueData);
  return response.data;
};

export const returnBook = async (borrowId: string): Promise<ApiResponse<BorrowRecord>> => {
  const response = await api.post<ApiResponse<BorrowRecord>>(`/api/return/${borrowId}`);
  return response.data;
};
