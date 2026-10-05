export interface Member {
  _id: string;
  name: string;
  email: string;
  membershipId: string;
  joinedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMemberRequest {
  name: string;
  email: string;
  membershipId: string;
}
