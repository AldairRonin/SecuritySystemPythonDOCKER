export type QrStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED';

export interface QrCode {
  id: string;
  guardianStudentId: string;
  token: string;
  expiresAt: string;
  status: QrStatus;
  createdAt: string;
  usedAt: string | null;
}
