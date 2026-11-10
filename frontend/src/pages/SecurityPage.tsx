import { useEffect, useRef, useState } from 'react';
import {
  Html5Qrcode,
  Html5QrcodeScannerState,
} from 'html5-qrcode';

import { useAuth } from '@/hooks/useAuth';
import {
  verifyQR,
  type QRVerifyResponse,
} from '@/services/api/qrService';
import {
  getAccessLogs,
  type AccessLog,
} from '@/services/api/accessLogService';

import './security.css';

export function SecurityPage() {
  const { token } = useAuth();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const verifyingRef = useRef(false);

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QRVerifyResponse | null>(null);

  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  async function loadAccessLogs() {
    if (!token) {
      return;
    }

    try {
      setLoadingLogs(true);

      const logs = await getAccessLogs(token);

      setAccessLogs(logs);
    } catch (err) {
      console.error('Failed to load access logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }

  async function startScanner() {
    setError(null);
    setResult(null);

    if (!token) {
      setError('Вы не авторизованы.');
      return;
    }

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },

        async (decodedText) => {
          if (verifyingRef.current) {
            return;
          }

          verifyingRef.current = true;

          try {
            setError(null);

            console.log('QR token:', decodedText);

            const response = await verifyQR(
              decodedText,
              token,
            );

            console.log('QR verification:', response);

            setResult(response);

            await stopScanner();

            await loadAccessLogs();
          } catch (err) {
            console.error('QR verification error:', err);

            setError(
              err instanceof Error
                ? err.message
                : 'Не удалось проверить QR-код',
            );
          } finally {
            verifyingRef.current = false;
          }
        },

        () => {
          // QR пока не найден
        },
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Camera error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось открыть камеру',
      );

      scannerRef.current = null;
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current;

    if (
      scanner &&
      scanner.getState() === Html5QrcodeScannerState.SCANNING
    ) {
      await scanner.stop();
      scanner.clear();
    }

    scannerRef.current = null;
    setIsScanning(false);
  }

  useEffect(() => {
    void loadAccessLogs();

    return () => {
      const scanner = scannerRef.current;

      if (
        scanner &&
        scanner.getState() === Html5QrcodeScannerState.SCANNING
      ) {
        void scanner.stop();
      }
    };
  }, [token]);

  const allowedCount = accessLogs.filter(
    (log) => log.result === 'ALLOWED',
  ).length;

  const deniedCount = accessLogs.filter(
    (log) => log.result === 'DENIED',
  ).length;

  return (
    <main className="security-dashboard">
      {/* Page header */}
      <header className="security-header">
        <div>
          <span className="security-header__eyebrow">
            ACCESS CONTROL
          </span>

          <h1>Security Dashboard</h1>

          <p>
            Контроль доступа и проверка посетителей
          </p>
        </div>

        <div className="security-status">
          <span className="security-status__dot" />
          Система активна
        </div>
      </header>

      {/* Statistics */}
      <section className="security-stats">
        <div className="security-stat">
          <div className="security-stat__icon">
            📋
          </div>

          <div>
            <span>Всего проверок</span>
            <strong>{accessLogs.length}</strong>
          </div>
        </div>

        <div className="security-stat security-stat--allowed">
          <div className="security-stat__icon">
            ✓
          </div>

          <div>
            <span>Разрешено</span>
            <strong>{allowedCount}</strong>
          </div>
        </div>

        <div className="security-stat security-stat--denied">
          <div className="security-stat__icon">
            ×
          </div>

          <div>
            <span>Отклонено</span>
            <strong>{deniedCount}</strong>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <section className="security-main-grid">
        {/* Scanner */}
        <div className="security-card scanner-card">
          <div className="security-card__header">
            <div>
              <span className="security-card__label">
                VERIFICATION
              </span>

              <h2>QR Scanner</h2>

              <p>
                Отсканируйте QR-код посетителя для
                проверки доступа.
              </p>
            </div>

            <div className="security-card__icon">
              ⌗
            </div>
          </div>

          <div
            className={`scanner-container ${
              isScanning
                ? 'scanner-container--active'
                : ''
            }`}
          >
            <div id="qr-reader" />

            {!isScanning && (
              <div className="scanner-placeholder">
                <div className="scanner-placeholder__icon">
                  📷
                </div>

                <h3>Готов к сканированию</h3>

                <p>
                  Нажмите кнопку ниже, чтобы включить
                  камеру.
                </p>
              </div>
            )}
          </div>

          {isScanning ? (
            <button
              type="button"
              className="security-button security-button--stop"
              onClick={stopScanner}
            >
              ■ Остановить сканирование
            </button>
          ) : (
            <button
              type="button"
              className="security-button"
              onClick={startScanner}
            >
              📷 Начать сканирование
            </button>
          )}

          {error && (
            <div className="security-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Last verification */}
        <div className="security-card result-card">
          <div className="security-card__header">
            <div>
              <span className="security-card__label">
                LAST CHECK
              </span>

              <h2>Последняя проверка</h2>
            </div>
          </div>

          {!result ? (
            <div className="result-empty">
              <div className="result-empty__icon">
                ✓
              </div>

              <h3>Проверок пока нет</h3>

              <p>
                Результат последнего сканирования
                появится здесь.
              </p>
            </div>
          ) : (
            <div
              className={`verification-result ${
                result.result === 'ALLOWED'
                  ? 'verification-result--allowed'
                  : 'verification-result--denied'
              }`}
            >
              <div className="verification-result__icon">
                {result.result === 'ALLOWED'
                  ? '✓'
                  : '×'}
              </div>

              <div className="verification-result__content">
                <span>
                  {result.result === 'ALLOWED'
                    ? 'ВХОД РАЗРЕШЁН'
                    : 'ВХОД ЗАПРЕЩЁН'}
                </span>

                <strong>
                  {result.reason}
                </strong>
              </div>
            </div>
          )}

          {result && (
            <div className="verification-details">
              {result.guardian_name && (
                <div>
                  <span>Родитель</span>
                  <strong>
                    {result.guardian_name}
                  </strong>
                </div>
              )}

              {result.student_name && (
                <div>
                  <span>Ученик</span>
                  <strong>
                    {result.student_name}
                  </strong>
                </div>
              )}

              {result.class_name && (
                <div>
                  <span>Класс</span>
                  <strong>
                    {result.class_name}
                  </strong>
                </div>
              )}

              {result.verified_at && (
                <div>
                  <span>Время проверки</span>
                  <strong>
                    {new Date(
                      result.verified_at,
                    ).toLocaleString('ru-RU')}
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* History */}
      <section className="security-card history-card">
        <div className="history-header">
          <div>
            <span className="security-card__label">
              ACCESS LOG
            </span>

            <h2>История посещений</h2>

            <p>
              Журнал всех попыток входа через QR-код.
            </p>
          </div>

          <div className="history-actions">
            <span className="history-count">
              {accessLogs.length} записей
            </span>

            <button
              type="button"
              className="refresh-button"
              onClick={loadAccessLogs}
              disabled={loadingLogs}
            >
              ↻
              {loadingLogs
                ? ' Обновление...'
                : ' Обновить'}
            </button>
          </div>
        </div>

        {loadingLogs && accessLogs.length === 0 ? (
          <div className="history-empty">
            Загрузка истории...
          </div>
        ) : accessLogs.length === 0 ? (
          <div className="history-empty">
            <div>📋</div>
            <h3>История пуста</h3>
            <p>
              После проверки QR-кодов записи появятся
              здесь.
            </p>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Результат</th>
                  <th>Причина</th>
                  <th>Действие</th>
                  <th>Время</th>
                </tr>
              </thead>

              <tbody>
                {accessLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span
                        className={`log-status ${
                          log.result === 'ALLOWED'
                            ? 'log-status--allowed'
                            : 'log-status--denied'
                        }`}
                      >
                        <span>
                          {log.result === 'ALLOWED'
                            ? '✓'
                            : '×'}
                        </span>

                        {log.result}
                      </span>
                    </td>

                    <td>
                      <span className="log-reason">
                        {log.reason}
                      </span>
                    </td>

                    <td>
                      <span className="log-action">
                        {log.action}
                      </span>
                    </td>

                    <td className="log-time">
                      {new Date(
                        log.created_at,
                      ).toLocaleString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}