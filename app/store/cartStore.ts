import { trackEvent } from "@/utils/analytics";
import { loadStripe } from "@stripe/stripe-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const stripePromise = loadStripe(`${process.env.STRIPE_SECRET_KEY!}`);

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant_id: number;
}

interface Product extends Omit<CartItem, "quantity"> {
  description: string;
  category: string;
  inStock: number;
}

interface CartStore {
  products: Product[];
  cart: CartItem[];
  isCartOpen: boolean;
  fetchProducts: () => Promise<void>;
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  checkout: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      products: [],
      cart: [],
      isCartOpen: false,

      fetchProducts: async () => {
        try {
          const response = await fetch("/api/printful/products");
          if (response.ok) {
            const products = await response.json();
            set({ products });
          }
        } catch (error) {
          console.error("Failed to fetch products:", error);
        }
      },

      addToCart: (product) =>
        set((state) => {
          trackEvent.addToCart(product);
          const existingItem = state.cart.find(
            (item) => item.id === product.id
          );
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return { cart: [...state.cart, { ...product, quantity: 1 }] };
          }
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),

      updateCartItemQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => set({ cart: [] }),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      getTotalItems: () =>
        get().cart.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),

      checkout: async () => {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe failed to load");

        const response = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: get().cart }),
        });

        const { sessionId } = await response.json();

        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) throw new Error(error.message);
      },
    }),
    {
      name: "okapi-cart",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      getStorage: () => localStorage,
    }
  )
);
