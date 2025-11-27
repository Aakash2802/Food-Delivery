const LoadingDots = ({ color = 'red', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colors = {
    red: 'bg-red-500',
    white: 'bg-white',
    gray: 'bg-gray-500',
    green: 'bg-green-500',
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizes[size]} ${colors[color]} rounded-full animate-bounce`}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
};

export default LoadingDots;
