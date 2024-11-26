import { trackEvent } from "@/utils/analytics";
import { loadStripe } from "@stripe/stripe-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const stripePromise = loadStripe(
  `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}`
);

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant_id: number;
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
  fetchProducts: () => Promise<void>;
  addToCart: (item: CartItem) => void;
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
      isLoading: false,

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
          trackEvent.addToCart(item);

          console.log("Adding item to cart:", item);
          const existingItem = state.cart.find(
            (cartItem) => cartItem.variant_id === item.variant_id
          );

          if (existingItem) {
            console.log("Updating existing item quantity");
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.variant_id === item.variant_id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem
              ),
            };
          }

          console.log("Adding new item to cart");
          return {
            cart: [
              ...state.cart,
              {
                ...item,
                price: Number(item.price), // Ensure price is a number
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
          (total, item) => total + Number(item.price) * item.quantity,
          0
        ),

      checkout: async () => {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe failed to load");

        try {
          const cartItems = get().cart.map((item) => ({
            ...item,
            price: Number(item.price), // Ensure price is a number
          }));

          const response = await fetch("/api/stripe/create-checkout-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: cartItems,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to create checkout session"
            );
          }

          const { sessionId } = await response.json();
          console.log("Created checkout session:", sessionId);

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
      getStorage: () => localStorage,
    }
  )
);
