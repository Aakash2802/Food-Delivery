import { useState, useEffect } from 'react';

const AnimatedBadge = ({
  count,
  maxCount = 99,
  className = '',
  color = 'red',
}) => {
  const [displayCount, setDisplayCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  const colors = {
    red: 'bg-red-500 text-white',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
    yellow: 'bg-yellow-500 text-black',
    orange: 'bg-orange-500 text-white',
  };

  useEffect(() => {
    if (count !== displayCount) {
      setIsAnimating(true);

      // Animate count change
      const diff = count - displayCount;
      const steps = Math.min(Math.abs(diff), 10);
      const stepValue = diff / steps;
      let current = displayCount;

      const interval = setInterval(() => {
        current += stepValue;
        if ((diff > 0 && current >= count) || (diff < 0 && current <= count)) {
          setDisplayCount(count);
          clearInterval(interval);
          setTimeout(() => setIsAnimating(false), 300);
        } else {
          setDisplayCount(Math.round(current));
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [count, displayCount]);

  if (count <= 0) return null;

  const displayValue = count > maxCount ? `${maxCount}+` : displayCount;

  return (
    <span
      className={`
        inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
        text-xs font-bold rounded-full
        ${colors[color]}
        ${isAnimating ? 'animate-pop' : ''}
        ${className}
      `}
    >
      {displayValue}
    </span>
  );
};

export default AnimatedBadge;
