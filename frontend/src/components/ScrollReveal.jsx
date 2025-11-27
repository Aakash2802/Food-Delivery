import useScrollReveal from '../hooks/useScrollReveal';

const ScrollReveal = ({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  once = true,
}) => {
  const [ref, isVisible] = useScrollReveal({ threshold, once });

  const animations = {
    'fade-up': {
      hidden: 'opacity-0 translate-y-10',
      visible: 'opacity-100 translate-y-0',
    },
    'fade-down': {
      hidden: 'opacity-0 -translate-y-10',
      visible: 'opacity-100 translate-y-0',
    },
    'fade-left': {
      hidden: 'opacity-0 translate-x-10',
      visible: 'opacity-100 translate-x-0',
    },
    'fade-right': {
      hidden: 'opacity-0 -translate-x-10',
      visible: 'opacity-100 translate-x-0',
    },
    'zoom-in': {
      hidden: 'opacity-0 scale-90',
      visible: 'opacity-100 scale-100',
    },
    'zoom-out': {
      hidden: 'opacity-0 scale-110',
      visible: 'opacity-100 scale-100',
    },
    'flip-up': {
      hidden: 'opacity-0 rotateX-90',
      visible: 'opacity-100 rotateX-0',
    },
  };

  const animationConfig = animations[animation] || animations['fade-up'];

  return (
    <div
      ref={ref}
      className={`transition-all ${className} ${
        isVisible ? animationConfig.visible : animationConfig.hidden
      }`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
