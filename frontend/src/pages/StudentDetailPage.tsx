import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { Link, Navigate, useParams } from 'react-router-dom';
import type { GuardianStudentWithDetails, QrCode } from '@/types';
import { getGuardianStudentById } from '@/services/api';
import { generateQr, getLatestQrForGuardianStudent } from '@/services/api';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { QRDisplay } from '@/components/QRDisplay/QRDisplay';
import { RELATIONSHIP_LABELS } from '@/components/StudentCard/StudentCard';

export function StudentDetailPage() {
  const { guardianStudentId } = useParams<{ guardianStudentId: string }>();
  const { token } = useAuth();
  const [link, setLink] = useState<GuardianStudentWithDetails | null | undefined>(undefined);
  const [qr, setQr] = useState<QrCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!guardianStudentId) return;
    let cancelled = false;

    getGuardianStudentById(guardianStudentId, token)
  .then((result) => {
    if (cancelled) return;

    setLink(result);

    if (result?.verificationStatus === 'APPROVED') {
  getLatestQrForGuardianStudent(result.id, token)
    .then((latest) => {
      if (!cancelled) {
        setQr(latest);
      }
    })
    .catch((error) => {
      console.error('Failed to load QR:', error);
    });
}
  })
  .catch((error) => {
    console.error('Failed to load guardian student:', error);

    if (!cancelled) {
      setLink(null);
    }
  });

    return () => {
      cancelled = true;
    };
  }, [guardianStudentId,token]);

  if (link === null) {
    return <Navigate to="/dashboard" replace />;
  }

  if (link === undefined || !guardianStudentId) {
    return (
      <main className="page">
        <p className="page__subtitle">Загрузка…</p>
      </main>
    );
  }

  async function handleGenerate() {
  if (!guardianStudentId) return;

  setIsGenerating(true);

  try {
    const created = await generateQr(guardianStudentId, token);
    setQr(created);
  } catch (error) {
    console.error('Failed to generate QR:', error);
  } finally {
    setIsGenerating(false);
  }
}

  return (
    <main className="page">
      <Link to="/dashboard" className="back-link">
        ← Ко всем детям
      </Link>

      <section className="detail-card">
        <div className="detail-card__header">
          <div>
            <h1 className="detail-card__name">{link.student.fullName}</h1>
            <p className="detail-card__meta">{link.student.className}</p>
          </div>
          <StatusBadge status={link.verificationStatus} />
        </div>

        <div className="detail-row">
          <span className="detail-row__label">Кем вы приходитесь ребёнку</span>
          <span className="detail-row__value">{RELATIONSHIP_LABELS[link.relationshipType]}</span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Класс</span>
          <span className="detail-row__value">{link.student.className}</span>
        </div>
      </section>

      {link.verificationStatus === 'APPROVED' && (
        <QRDisplay qr={qr} isGenerating={isGenerating} onGenerate={handleGenerate} />
      )}

      {link.verificationStatus === 'PENDING' && (
        <div className="notice notice--pending">
          Ваша заявка на подтверждение находится на рассмотрении у администратора школы.
          Как только она будет одобрена, здесь появится возможность сгенерировать QR-код для прохода.
        </div>
      )}

      {link.verificationStatus === 'REJECTED' && (
        <div className="notice notice--rejected">
          Заявка на подтверждение была отклонена администратором школы.
          Обратитесь в администрацию, чтобы уточнить причину и подать заявку повторно.
        </div>
      )}
    </main>
  );
}
