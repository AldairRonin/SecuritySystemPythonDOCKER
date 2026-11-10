import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { GuardianStudentWithDetails } from '@/types';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import {
  deleteGuardianStudent,
  resubmitVerificationRequest,
} from '@/services/api/guardianService';

const RELATIONSHIP_LABELS: Record<string, string> = {
  FATHER: 'Отец',
  MOTHER: 'Мать',
  GRANDFATHER: 'Дедушка',
  GRANDMOTHER: 'Бабушка',
  GUARDIAN: 'Доверенное лицо',
};

export function StudentCard({
  link,
}: {
  link: GuardianStudentWithDetails;
}) {
  const { token } = useAuth();

  const [status, setStatus] = useState(link.verificationStatus);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResubmit() {
    try {
      setLoading(true);
      setError(null);

      await resubmitVerificationRequest(link.id, token);

      setStatus('PENDING');
    } catch (err) {
      console.error(err);
      setError('Не удалось отправить заявку повторно.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Удалить ${link.student.fullName} из вашего аккаунта?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      await deleteGuardianStudent(link.id, token);

      // Уведомляем страницу, что ребёнок был удалён.
      window.dispatchEvent(
        new CustomEvent('guardian-student-deleted', {
          detail: link.id,
        }),
      );
    } catch (err) {
      console.error(err);
      setError('Не удалось удалить ученика.');
      setDeleting(false);
    }
  }

  return (
    <article className="student-card">
      <div className="student-card__main">
        <Link
          to={`/students/${link.id}`}
          className="student-card__link"
        >
          <div>
            <p className="student-card__name">
              {link.student.fullName}
            </p>

            <p className="student-card__meta">
              {link.student.className} ·{' '}
              {RELATIONSHIP_LABELS[link.relationshipType]}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <StatusBadge status={status} />

            <span
              className="student-card__chevron"
              aria-hidden="true"
            >
              ›
            </span>
          </div>
        </Link>

        <button
          type="button"
          className="student-card__delete"
          onClick={handleDelete}
          disabled={deleting}
          title="Удалить ученика из аккаунта"
          aria-label={`Удалить ${link.student.fullName}`}
        >
          {deleting ? '...' : '🗑'}
        </button>
      </div>

      {status === 'REJECTED' && (
        <div className="student-card__resubmit">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleResubmit}
            disabled={loading}
          >
            {loading
              ? 'Отправка…'
              : 'Подать заявку повторно'}
          </button>
        </div>
      )}

      {error && (
        <p className="form-error student-card__error">
          {error}
        </p>
      )}
    </article>
  );
}

export { RELATIONSHIP_LABELS };