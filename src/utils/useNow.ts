import { useEffect, useState } from 'react';

/**
 * The current time, refreshed every `intervalMs`. Only components that show a countdown use it,
 * so the clock re-renders a pill or a sheet instead of the whole game screen every second.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}
