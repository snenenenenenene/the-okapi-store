import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  variantId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
}

interface CartStore {
  cart: CartItem[];
  isCartOpen: boolean;
  appliedDiscount: DiscountCode | null;
  shipping: number;
  products: any[];

  // Cart actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId: number) => void;
  updateCartItemQuantity: (productId: string, variantId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;

  // Discount actions
  applyDiscount: (code: string) => { success: boolean; message: string };
  removeDiscount: () => void;

  // Calculations
  getTotalItems: () => number;
  getSubtotal: () => number;
  getShippingCost: () => number;
  getDiscount: () => number;
  getTotalPrice: () => number;

  // Product fetching
  fetchProducts: () => Promise<void>;
}

const DISCOUNT_CODES: { [key: string]: DiscountCode } = {
  'OKAPI': { code: 'OKAPI', type: 'percentage', value: 10 }, // 10% off
  'WELCOME': { code: 'WELCOME', type: 'fixed', value: 5 }, // €5 off
  'OKAPI10': { code: 'OKAPI10', type: 'percentage', value: 10 }, // 10% off
  'OKAPI20': { code: 'OKAPI20', type: 'percentage', value: 20 }, // 20% off
  'FREESHIP': { code: 'FREESHIP', type: 'fixed', value: 5 }, // Free shipping
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      appliedDiscount: null,
      shipping: 5,
      products: [],

      addToCart: (item) =>
        set((state) => {
          console.log("Adding to cart:", item);
          const existingItem = state.cart.find(
            (cartItem) => cartItem.variantId === item.variantId
          );

          if (existingItem) {
            console.log("existing cart", state.cart);
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.variantId === item.variantId
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem
              ),
            };
          }

          console.log("new cart", state.cart);
          return {
            cart: [...state.cart, { ...item, quantity: 1 }],
          };
        }),

      removeFromCart: (productId, variantId) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item.id === productId && item.variantId === variantId)
          ),
        })),

      updateCartItemQuantity: (productId: string, variantId: number, quantity: number) =>
        set((state) => {
          // Ensure quantity is within bounds
          const safeQuantity = Math.max(1, Math.min(10, quantity));
          
          return {
            cart: state.cart.map((item) =>
              item.id === productId && item.variantId === variantId
                ? { ...item, quantity: safeQuantity }
                : item
            ),
          };
        }),

      clearCart: () => set({ cart: [], appliedDiscount: null }),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      applyDiscount: (code: string) => {
        const discount = DISCOUNT_CODES[code.toUpperCase()];
        if (discount) {
          const state = get();
          const subtotal = state.getSubtotal();
          
          // Minimum amount validation (example: €50 for percentage discounts)
          if (discount.type === 'percentage' && subtotal < 50) {
            return {
              success: false,
              message: 'Minimum purchase of €50 required for this discount'
            };
          }

          set({ appliedDiscount: discount });
          return { success: true, message: 'Discount applied successfully!' };
        }
        return { success: false, message: 'Invalid discount code' };
      },

      removeDiscount: () => set({ appliedDiscount: null }),

      getTotalItems: () => {
        const state = get();
        return state.cart.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const state = get();
        return state.cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getShippingCost: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        const hasShippingDiscount = state.appliedDiscount?.code === 'FREESHIP';
        return (subtotal >= 100 || hasShippingDiscount) ? 0 : state.shipping;
      },

      getDiscount: () => {
        const state = get();
        if (!state.appliedDiscount) return 0;
        
        const subtotal = state.getSubtotal();
        if (state.appliedDiscount.type === 'percentage') {
          return (subtotal * state.appliedDiscount.value) / 100;
        }
        return state.appliedDiscount.value;
      },

      getTotalPrice: () => {
        const state = get();
        return state.getSubtotal() + state.getShippingCost() - state.getDiscount();
      },

      fetchProducts: async () => {
        try {
          const response = await fetch("/api/printful/products");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const products = await response.json();
          console.log("Fetched products:", products);
          set({ products });
        } catch (error) {
          console.error("Failed to fetch products:", error);
        }
      },
    }),
    {
      name: "okapi-cart",
      getStorage: () => localStorage,
    }
  )
);