import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ConfettiPiece = ({ style }) => (
  <div
    className="fixed pointer-events-none"
    style={{
      ...style,
      width: '10px',
      height: '10px',
      borderRadius: Math.random() > 0.5 ? '50%' : '0',
    }}
  />
);

const Confetti = ({ active, duration = 3000, particleCount = 100 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const colors = [
      '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
      '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24'
    ];

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 500,
      duration: 2000 + Math.random() * 1000,
      size: 5 + Math.random() * 10,
      rotation: Math.random() * 360,
    }));

    setParticles(newParticles);

    const timeout = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timeout);
  }, [active, duration, particleCount]);

  if (particles.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: particle.x,
            top: -20,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confettiFall ${particle.duration}ms ease-out ${particle.delay}ms forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default Confetti;
