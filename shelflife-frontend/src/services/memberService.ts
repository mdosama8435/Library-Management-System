import api from './api';
import type { CreateMemberRequest, Member } from '../types/member';
import type { BorrowRecord } from '../types/borrowRecord';
import type { ApiResponse } from '../types/common';

export const getMembers = async (): Promise<ApiResponse<Member[]>> => {
  const response = await api.get<ApiResponse<Member[]>>('/api/members');
  return response.data;
};

export const createMember = async (memberData: CreateMemberRequest): Promise<ApiResponse<Member>> => {
  const response = await api.post<ApiResponse<Member>>('/api/members', memberData);
  return response.data;
};

export const getMemberHistory = async (memberId: string): Promise<ApiResponse<BorrowRecord[]>> => {
  const response = await api.get<ApiResponse<BorrowRecord[]>>(`/api/members/${memberId}/history`);
  return response.data;
};
