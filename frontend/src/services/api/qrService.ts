import type { QrCode } from '@/types';
import { apiRequest } from './client';

interface BackendQrCode {
  id: string;
  guardian_student_id: string;
  token: string;
  expires_at: string;
  status: QrCode['status'];
  created_at: string;
  used_at: string | null;
}

function mapQrCode(data: BackendQrCode): QrCode {
  return {
    id: data.id,
    guardianStudentId: data.guardian_student_id,
    token: data.token,
    expiresAt: data.expires_at,
    status: data.status,
    createdAt: data.created_at,
    usedAt: data.used_at,
  };
}

export async function getLatestQrForGuardianStudent(
  guardianStudentId: string,
  token?: string | null,
): Promise<QrCode | null> {
  const qrCodes = await apiRequest<BackendQrCode[]>('/qr-codes/', {
    token,
  });

  const candidates = qrCodes
    .filter((qr) => qr.guardian_student_id === guardianStudentId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    );

  const latest = candidates[0] ?? null;

  return latest ? mapQrCode(latest) : null;
}

export async function generateQr(
  guardianStudentId: string,
  token?: string | null,
): Promise<QrCode> {
  const qr = await apiRequest<BackendQrCode>('/qr-codes/', {
    method: 'POST',
    token,
    body: {
      guardian_student_id: guardianStudentId,
      expires_in_minutes: 15,
    },
  });

  return mapQrCode(qr);
}
export interface QRVerifyResponse {
  result: 'ALLOWED' | 'DENIED';
  reason: string;
  guardian_name?: string;
  student_name?: string;
  class_name?: string;
  verified_at?: string;
}

export async function verifyQR(
  qrToken: string,
  token?: string | null,
): Promise<QRVerifyResponse> {
  return apiRequest<QRVerifyResponse>('/qr-codes/verify', {
    method: 'POST',
    token,
    body: {
      token: qrToken,
    },
  });
}