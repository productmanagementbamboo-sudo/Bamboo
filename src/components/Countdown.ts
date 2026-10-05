import { useCallback, useEffect, useState } from 'react';

/** Seconds-left countdown; `restart()` resets it. */
export function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  const [run, setRun] = useState(0);
  useEffect(() => {
    setLeft(seconds);
    const h = setInterval(() => setLeft((s) => (s <= 1 ? (clearInterval(h), 0) : s - 1)), 1000);
    return () => clearInterval(h);
  }, [seconds, run]);
  const restart = useCallback(() => setRun((r) => r + 1), []);
  return { left, restart };
}
