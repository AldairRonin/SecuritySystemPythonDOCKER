export type UserRole = 'PARENT' | 'TRUSTED_PERSON' | 'SECURITY' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface User {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}