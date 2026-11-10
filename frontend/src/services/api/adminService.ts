import { apiRequest } from './client';

export interface VerificationRequest {
  id: string;
  guardian_student_id: string;

  guardian_name: string;
  student_name: string;
  class_name: string;
  relationship_type: string;

  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment: string | null;
  created_at: string;
  reviewed_at: string | null;
}
export async function getVerificationRequests(
  token?: string | null,
): Promise<VerificationRequest[]> {
  return apiRequest<VerificationRequest[]>(
    '/verification-requests/',
    {
      token,
    },
  );
}

export async function approveVerificationRequest(
  requestId: string,
  token?: string | null,
): Promise<VerificationRequest> {
  return apiRequest<VerificationRequest>(
    `/verification-requests/${requestId}/approve`,
    {
      method: 'PATCH',
      token,
    },
  );
}

export async function rejectVerificationRequest(
  requestId: string,
  comment: string,
  token?: string | null,
): Promise<VerificationRequest> {
  return apiRequest<VerificationRequest>(
    `/verification-requests/${requestId}/reject`,
    {
      method: 'PATCH',
      token,
      body: {
        comment,
      },
    },
  );
}