import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  variantId: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, variantId: string) => void;
  updateQuantity: (id: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addToCart: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.variantId === item.variantId
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        }),
      removeFromCart: (id, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === id && item.variantId === variantId)
          ),
        })),
      updateQuantity: (id, variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id && item.variantId === variantId
              ? { ...item, quantity }
              : item
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
