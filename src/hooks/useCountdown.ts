import { useState, useEffect } from "react";

/**
 * useCountdown — tracks time remaining until a future date.
 *
 * Returns `null` when the target date has passed or is not provided.
 */
export interface CountdownRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useCountdown(
  endDate: Date | string | undefined,
): CountdownRemaining | null {
  const getRemaining = (): CountdownRemaining | null => {
    if (!endDate) return null;
    const end = endDate instanceof Date ? endDate : new Date(endDate as string);
    const diff = end.getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  };

  const [remaining, setRemaining] = useState<CountdownRemaining | null>(
    getRemaining,
  );

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);

  return remaining;
}
