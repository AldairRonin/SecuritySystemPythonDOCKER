import { useEffect, useState } from 'react';

/**
 * Returns remaining whole seconds until `targetIso`, ticking every second.
 * Returns 0 once the target has passed. Purely a display aid — the
 * backend/security scan is the source of truth for actual expiry.
 */
export function useCountdown(targetIso: string | null): number {
  const [remaining, setRemaining] = useState<number>(() => computeRemaining(targetIso));

  useEffect(() => {
    setRemaining(computeRemaining(targetIso));
    if (!targetIso) return;

    const interval = setInterval(() => {
      setRemaining(computeRemaining(targetIso));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetIso]);

  return remaining;
}

function computeRemaining(targetIso: string | null): number {
  if (!targetIso) return 0;

  const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/i.test(targetIso);

  const normalizedDate = hasTimezone
    ? targetIso
    : `${targetIso}Z`;

  const diffMs = new Date(normalizedDate).getTime() - Date.now();

  return Math.max(0, Math.floor(diffMs / 1000));
}