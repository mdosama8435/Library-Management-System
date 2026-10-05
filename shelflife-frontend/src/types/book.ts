export interface Book {
  _id: string;
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookQuery {
  page?: number;
  limit?: number;
  genre?: string;
}
