const SuccessCheckmark = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const checkSizes = {
    sm: 'w-6 h-3',
    md: 'w-10 h-5',
    lg: 'w-16 h-8',
    xl: 'w-20 h-10',
  };

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      {/* Circle */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-green-600 animate-scale-in shadow-lg shadow-green-500/30">
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
      </div>

      {/* Checkmark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`${checkSizes[size]} border-b-4 border-r-4 border-white transform rotate-45 translate-y-[-10%] animate-success-check`}
        />
      </div>

      {/* Sparkles */}
      <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      <div className="absolute top-1/2 -right-3 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />

      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
      `}</style>
    </div>
  );
};

export default SuccessCheckmark;
