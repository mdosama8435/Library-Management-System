import api from './api';
import type { LoginRequest, LoginResponse } from '../types/auth';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/api/auth/login', credentials);
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('shelflife_token');
  localStorage.removeItem('shelflife_user');
};
