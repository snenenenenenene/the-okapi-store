// usePaymentIntentHandler.ts
import { useCallback, useRef } from "react";

function usePaymentIntentHandler() {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastRequestRef = useRef<string>();

  return useCallback(
    async (cart: any[], shippingRate: any, paymentIntentId: string | null) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const requestKey = JSON.stringify({ cart, shippingRate });
      if (requestKey === lastRequestRef.current) {
        return null;
      }

      lastRequestRef.current = requestKey;

      return new Promise((resolve) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            const response = await fetch("/api/payment-intent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: cart,
                shipping_rate: shippingRate,
                paymentIntentId,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to update payment intent");
            }

            const data = await response.json();
            resolve(data);
          } catch (error) {
            console.error("Payment intent update error:", error);
            resolve(null);
          }
        }, 500);
      });
    },
    []
  );
}

export default usePaymentIntentHandler;
