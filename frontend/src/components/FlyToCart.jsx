import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const FlyingItem = ({ startX, startY, onComplete, image }) => {
  const [style, setStyle] = useState({
    left: startX,
    top: startY,
    opacity: 1,
    transform: 'scale(1)',
  });

  useEffect(() => {
    // Get cart icon position
    const cartIcon = document.querySelector('[data-cart-icon]');
    if (!cartIcon) {
      onComplete();
      return;
    }

    const cartRect = cartIcon.getBoundingClientRect();
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    // Start animation
    requestAnimationFrame(() => {
      setStyle({
        left: endX,
        top: endY,
        opacity: 0,
        transform: 'scale(0.2)',
      });
    });

    const timeout = setTimeout(onComplete, 800);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return createPortal(
    <div
      className="fixed pointer-events-none z-[9999] transition-all duration-700 ease-out"
      style={{
        left: style.left,
        top: style.top,
        opacity: style.opacity,
        transform: `translate(-50%, -50%) ${style.transform}`,
      }}
    >
      {image ? (
        <img
          src={image}
          alt="Flying item"
          className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-white"
        />
      ) : (
        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg flex items-center justify-center">
          <span className="text-white text-xl">+</span>
        </div>
      )}
    </div>,
    document.body
  );
};

// Global state for flying items
let flyingItems = [];
let setFlyingItemsExternal = null;

export const triggerFlyToCart = (x, y, image = null) => {
  if (setFlyingItemsExternal) {
    const id = Date.now();
    setFlyingItemsExternal((prev) => [...prev, { id, x, y, image }]);
  }
};

const FlyToCartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setFlyingItemsExternal = setItems;
    return () => {
      setFlyingItemsExternal = null;
    };
  }, []);

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      {children}
      {items.map((item) => (
        <FlyingItem
          key={item.id}
          startX={item.x}
          startY={item.y}
          image={item.image}
          onComplete={() => removeItem(item.id)}
        />
      ))}
    </>
  );
};

export default FlyToCartProvider;
