import { useState } from 'react';
import { Heart } from 'lucide-react';

const HeartButton = ({ initialLiked = false, onToggle, className = '' }) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsAnimating(true);
    setIsLiked(!isLiked);

    if (onToggle) onToggle(!isLiked);

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-300 ${
        isLiked
          ? 'bg-red-100 dark:bg-red-900/30'
          : 'bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${className}`}
    >
      <Heart
        className={`w-5 h-5 transition-all duration-300 ${
          isLiked
            ? 'text-red-500 fill-red-500'
            : 'text-gray-500 dark:text-gray-400'
        } ${isAnimating ? 'animate-heart-beat' : ''}`}
      />
    </button>
  );
};

export default HeartButton;
