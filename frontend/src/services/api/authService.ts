import type { User } from '@/types';
import { apiRequest } from './client';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface BackendUser {
  id: string;
  full_name: string;
  username: string;
  role: User['role'];
  status: User['status'];
  created_at: string;
  updated_at: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

function mapUser(user: BackendUser): User {
  return {
    id: user.id,
    fullName: user.full_name,
    username: user.username,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  const tokenResponse = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: {
      username,
      password,
    },
  });

  const backendUser = await apiRequest<BackendUser>('/auth/me', {
    token: tokenResponse.access_token,
  });

  return {
    user: mapUser(backendUser),
    token: tokenResponse.access_token,
  };
}

export async function logout(): Promise<void> {
  return;
}