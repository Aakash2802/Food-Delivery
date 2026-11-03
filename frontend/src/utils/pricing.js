// Mirrors calculateOrderPricing in backend/src/utils/helpers.js so the amounts
// shown in the cart/checkout match what the order is actually charged.
// Keep these two in sync.
export const PLATFORM_FEE = 5;
export const TAX_RATE = 0.09; // 9% GST on (subtotal + delivery fee)

const round2 = (n) => Math.round(n * 100) / 100;

export const calculatePricing = (subtotal, deliveryFee = 0, discount = 0) => {
  if (subtotal <= 0) {
    return { subtotal: 0, deliveryFee: 0, taxes: 0, platformFee: 0, discount: 0, total: 0 };
  }
  const taxes = round2((subtotal + deliveryFee) * TAX_RATE);
  return {
    subtotal: round2(subtotal),
    deliveryFee: round2(deliveryFee),
    taxes,
    platformFee: PLATFORM_FEE,
    discount: round2(discount),
    total: round2(subtotal + deliveryFee + taxes + PLATFORM_FEE - discount)
  };
};
