import { apiRequest } from './client';

export interface AccessLog {
  id: string;
  qr_code_id: string;
  security_user_id: string;
  action: string;
  result: 'ALLOWED' | 'DENIED';
  reason: string;
  created_at: string;
}

export async function getAccessLogs(
  token?: string | null,
): Promise<AccessLog[]> {
  return apiRequest<AccessLog[]>('/access-logs/', {
    token,
  });
}