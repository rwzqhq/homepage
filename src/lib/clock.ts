import { useEffect, useState } from 'react';

export function useClock(interval = 500): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), interval);
    return () => window.clearInterval(id);
  }, [interval]);

  return now;
}

export function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}
