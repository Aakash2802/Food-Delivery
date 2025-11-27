import { useState } from 'react';
import { Star } from 'lucide-react';

const AnimatedRating = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRate,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const handleClick = (value) => {
    if (!interactive) return;
    setIsAnimating(true);
    if (onRate) onRate(value);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(maxRating)].map((_, index) => {
        const value = index + 1;
        const isFilled = value <= displayRating;
        const isHalf = value - 0.5 <= displayRating && value > displayRating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(value)}
            onMouseEnter={() => interactive && setHoverRating(value)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`relative transition-all duration-200 ${
              interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'
            } ${isAnimating && isFilled ? 'animate-pop' : ''}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Empty Star (Background) */}
            <Star
              className={`${sizes[size]} text-gray-300 dark:text-gray-600 transition-colors duration-200`}
            />

            {/* Filled Star (Overlay) */}
            <div
              className="absolute inset-0 overflow-hidden transition-all duration-300"
              style={{ width: isFilled ? '100%' : isHalf ? '50%' : '0%' }}
            >
              <Star
                className={`${sizes[size]} text-yellow-400 fill-yellow-400 transition-all duration-300 ${
                  isFilled ? 'drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]' : ''
                }`}
              />
            </div>

            {/* Sparkle effect on click */}
            {isAnimating && isFilled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              </div>
            )}
          </button>
        );
      })}

      {/* Rating text */}
      {rating > 0 && (
        <span className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default AnimatedRating;
