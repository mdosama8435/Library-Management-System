import api from './api';
import type { Book, BookQuery, CreateBookRequest } from '../types/book';
import type { ApiResponse, PaginatedResponse } from '../types/common';

export const getBooks = async (query?: BookQuery): Promise<PaginatedResponse<Book>> => {
  const params: Record<string, string | number> = {};
  if (query?.page) params.page = query.page;
  if (query?.limit) params.limit = query.limit;
  if (query?.genre) params.genre = query.genre;

  const response = await api.get<PaginatedResponse<Book>>('/api/books', { params });
  return response.data;
};

export const createBook = async (bookData: CreateBookRequest): Promise<ApiResponse<Book>> => {
  const response = await api.post<ApiResponse<Book>>('/api/books', bookData);
  return response.data;
};
