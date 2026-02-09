import { useEffect, useState } from 'react';

type Options = {
  length: number;
  auto?: boolean;
  delay?: number;
  reduceMotion?: boolean;
  initialIndex?: number;
};

export const useGallery = ({
  length,
  auto = true,
  delay = 4200,
  reduceMotion = false,
  initialIndex = 0,
}: Options) => {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (!auto || reduceMotion || length < 2) return undefined;
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, delay);
    return () => window.clearInterval(interval);
  }, [auto, delay, length, reduceMotion]);

  return { index, setIndex };
};
