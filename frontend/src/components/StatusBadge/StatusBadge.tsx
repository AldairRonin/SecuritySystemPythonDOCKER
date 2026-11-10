import type { QrStatus, VerificationStatus } from '@/types';

type Status = VerificationStatus | QrStatus;

const LABELS: Record<Status, string> = {
  APPROVED: 'Подтверждено',
  PENDING: 'На рассмотрении',
  REJECTED: 'Отклонено',
  ACTIVE: 'Активен',
  USED: 'Использован',
  EXPIRED: 'Истёк',
  REVOKED: 'Отозван',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status-badge status-badge--${status.toLowerCase()}`}>
      {LABELS[status]}
    </span>
  );
}
