// utils/analytics.ts
import { getCookiePreferences } from "./cookieManager";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  variant?: string;
  category?: string;
}

export const trackEvent = {
  viewProduct: (product: Product) => {
    const { analytics, marketing } = getCookiePreferences();

    if (analytics) {
      window.gtag("event", "view_item", {
        currency: "EUR",
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: 1,
          },
        ],
      });
    }

    if (marketing) {
      window.fbq("track", "ViewContent", {
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: product.price,
        currency: "EUR",
      });
    }
  },

  addToCart: (product: Product) => {
    const { analytics, marketing } = getCookiePreferences();

    if (analytics) {
      window.gtag("event", "add_to_cart", {
        currency: "EUR",
        value: product.price * (product.quantity || 1),
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: product.quantity || 1,
          },
        ],
      });
    }

    if (marketing) {
      window.fbq("track", "AddToCart", {
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: product.price * (product.quantity || 1),
        currency: "EUR",
      });
    }
  },

  beginCheckout: (products: Product[]) => {
    const { analytics, marketing } = getCookiePreferences();
    const total = products.reduce(
      (sum, product) => sum + product.price * (product.quantity || 1),
      0
    );

    if (analytics) {
      window.gtag("event", "begin_checkout", {
        currency: "EUR",
        value: total,
        items: products.map((product) => ({
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity || 1,
        })),
      });
    }

    if (marketing) {
      window.fbq("track", "InitiateCheckout", {
        contents: products.map((product) => ({
          id: product.id,
          quantity: product.quantity || 1,
        })),
        value: total,
        currency: "EUR",
      });
    }
  },

  purchase: (orderId: string, products: Product[], total: number) => {
    const { analytics, marketing } = getCookiePreferences();

    if (analytics) {
      window.gtag("event", "purchase", {
        transaction_id: orderId,
        value: total,
        currency: "EUR",
        items: products.map((product) => ({
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity || 1,
        })),
      });
    }

    if (marketing) {
      window.fbq("track", "Purchase", {
        content_ids: products.map((p) => p.id),
        contents: products.map((product) => ({
          id: product.id,
          quantity: product.quantity || 1,
        })),
        value: total,
        currency: "EUR",
        order_id: orderId,
      });
    }
  },
};
