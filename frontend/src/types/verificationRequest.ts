export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VerificationRequest {
  id: string;
  guardianStudentId: string;
  status: RequestStatus;
  comment: string | null;
  createdAt: string;
  reviewedAt: string | null;
}
