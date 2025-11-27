import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      restaurant: null,
      cartBounce: false,

      triggerCartBounce: () => {
        set({ cartBounce: true });
        setTimeout(() => set({ cartBounce: false }), 500);
      },

      addItem: (item, restaurant) => {
        // Validate restaurant has required fields
        if (!restaurant || !restaurant._id || !restaurant.name) {
          console.error('Invalid restaurant object:', restaurant);
          return;
        }
        const { items, restaurant: currentRestaurant, triggerCartBounce } = get();

        // Check if switching restaurants
        if (currentRestaurant && currentRestaurant._id !== restaurant._id) {
          const confirmed = window.confirm(
            'Your cart contains items from another restaurant. Do you want to clear it and start a new order?'
          );
          if (!confirmed) return;
          set({ items: [], restaurant });
        }

        // Check if item already exists
        const existingIndex = items.findIndex(
          (i) => i.menuItemId === item.menuItemId &&
          JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
        );

        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += item.quantity;
          set({ items: newItems });
        } else {
          set({ items: [...items, item], restaurant });
        }

        // Trigger cart bounce animation
        triggerCartBounce();
      },

      removeItem: (index) => {
        const newItems = get().items.filter((_, i) => i !== index);
        set({ items: newItems });
        if (newItems.length === 0) {
          set({ restaurant: null });
        }
      },

      updateQuantity: (index, quantity) => {
        if (quantity <= 0) {
          get().removeItem(index);
          return;
        }
        const newItems = [...get().items];
        newItems[index].quantity = quantity;
        set({ items: newItems });
      },

      clearCart: () => set({ items: [], restaurant: null }),

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const itemPrice = item.price;
          const customizationPrice = item.customizations?.reduce(
            (sum, c) => sum + (c.additionalPrice || 0),
            0
          ) || 0;
          return total + (itemPrice + customizationPrice) * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
