import { QRCodeSVG } from 'qrcode.react';
import type { QrCode } from '@/types';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useCountdown } from '@/hooks/useCountdown';

interface QRDisplayProps {
  qr: QrCode | null;
  isGenerating: boolean;
  onGenerate: () => void;
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function QRDisplay({ qr, isGenerating, onGenerate }: QRDisplayProps) {
  const isActive = qr?.status === 'ACTIVE';
  const remainingSeconds = useCountdown(isActive ? qr!.expiresAt : null);
  const displayStatus = isActive && remainingSeconds === 0 ? 'EXPIRED' : qr?.status;

  const showCode = isActive && remainingSeconds > 0;
  const canGenerate = !isGenerating && (!qr || displayStatus !== 'ACTIVE');

  return (
    <div className="qr-panel">
      <div className={`qr-panel__code${showCode ? '' : ' qr-panel__code--dimmed'}`}>
        <QRCodeSVG value={qr?.token ?? 'no-active-code'} size={176} />
      </div>

      {qr && (
        <div className="qr-panel__status-row">
          <StatusBadge status={displayStatus ?? qr.status} />
        </div>
      )}

      {showCode && (
        <p className="qr-panel__timer">Действителен ещё {formatCountdown(remainingSeconds)}</p>
      )}

      {!qr && <p className="qr-panel__timer">QR-код ещё не создан</p>}

      <button className="btn-accent" onClick={onGenerate} disabled={!canGenerate}>
        {isGenerating ? 'Генерация…' : qr ? 'Сгенерировать новый QR' : 'Сгенерировать QR'}
      </button>

      <p className="qr-panel__helper">
        QR одноразовый и действует {qr ? 'ограниченное время' : '15 минут'} после генерации.
        Покажите его охране при входе на территорию школы.
      </p>
    </div>
  );
}
