import { useEffect, useRef, useState } from 'react';

export const useExamTimer = (durationMinutes: number, onExpire?: () => void) => {
  const totalSeconds = Math.max(durationMinutes, 1) * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    setTimeLeft(totalSeconds);
    expiredRef.current = false;
  }, [totalSeconds]);

  useEffect(() => {
    if (timeLeft <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire?.();
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return {
    timeLeft,
    minutes,
    seconds,
    progress,
    formatted: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  };
};
