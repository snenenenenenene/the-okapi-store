// app/store/cartStore.ts
import { trackEvent } from "@/utils/analytics";
import { loadStripe } from "@stripe/stripe-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const stripePromise = loadStripe(
  `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}`
);

interface CartItem {
  id: string;
  variant_id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

interface Product extends Omit<CartItem, "quantity" | "size"> {
  description: string;
  category: string;
  inStock: boolean;
  variants: Array<{
    id: number;
    name: string;
    price: number;
    size: string;
    inStock: boolean;
  }>;
}

interface CartStore {
  products: Product[];
  cart: CartItem[];
  isCartOpen: boolean;
  isLoading: boolean;
  email: string | null;
  shippingAddress: any | null;
  selectedRate: any | null;
  fetchProducts: () => Promise<void>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setCheckoutData: (email: string, shippingAddress: any, selectedRate: any) => void;
  clearCheckoutData: () => void;
  checkout: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      products: [],
      cart: [],
      isCartOpen: false,
      isLoading: false,
      email: null,
      shippingAddress: null,
      selectedRate: null,

      fetchProducts: async () => {
        try {
          set({ isLoading: true });
          const response = await fetch("/api/printful/products");

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const products = await response.json();
          set({ products, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch products:", error);
          set({ isLoading: false });
        }
      },

      addToCart: (item) =>
        set((state) => {
          // Validate required variant_id
          if (!item.variant_id) {
            console.error("Attempted to add item without variant_id:", item);
            throw new Error("variant_id is required for cart items");
          }

          trackEvent.addToCart(item);
          

          const existingItem = state.cart.find(
            (cartItem) => cartItem.variant_id === item.variant_id
          );

          if (existingItem) {
            
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.variant_id === item.variant_id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem
              ),
            };
          }

          
          return {
            cart: [
              ...state.cart,
              {
                ...item,
                price: Number(item.price),
                quantity: 1,
              },
            ],
          };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),

      updateCartItemQuantity: (productId: string, quantity: number) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              cart: state.cart.filter((item) => item.id !== productId),
            };
          }
          return {
            cart: state.cart.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            ),
          };
        }),

      clearCart: () => set({ cart: [] }),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      getTotalItems: () =>
        get().cart.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().cart.reduce(
          (total, item) => total + Number(item.price) * item.quantity,
          0
        ),

      setCheckoutData: (email, shippingAddress, selectedRate) =>
        set({ email, shippingAddress, selectedRate }),

      clearCheckoutData: () =>
        set({ email: null, shippingAddress: null, selectedRate: null }),

      checkout: async () => {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe failed to load");

        try {
          const cartItems = get().cart.map((item) => ({
            ...item,
            price: Number(item.price),
          }));

          const response = await fetch("/api/stripe/create-checkout-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: cartItems,
              email: get().email,
              shippingAddress: get().shippingAddress,
              selectedRate: get().selectedRate,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to create checkout session"
            );
          }

          const { sessionId } = await response.json();
          

          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
            console.error("Stripe redirect error:", error);
            throw error;
          }
        } catch (error) {
          console.error("Checkout error:", error);
          throw error;
        }
      },
    }),
    {
      name: "okapi-cart",
      // @ts-ignore
      getStorage: () => localStorage,
    }
  )
);
