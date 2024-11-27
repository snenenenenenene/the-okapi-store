// app/checkout/usePaymentIntentHandler.ts
import { useCallback, useRef } from "react";

function usePaymentIntentHandler() {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastRequestRef = useRef<string>();

  return useCallback(
    async (cart: any[], shippingRate: any, paymentIntentId: string | null) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Validate cart items
      if (cart.some((item) => !item.variant_id)) {
        console.error("Invalid cart items:", cart);
        throw new Error("All cart items must have variant_id");
      }

      const requestKey = JSON.stringify({ cart, shippingRate });
      if (requestKey === lastRequestRef.current) {
        return null;
      }

      lastRequestRef.current = requestKey;

      return new Promise((resolve) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            console.log("Updating payment intent with:", {
              cart,
              shippingRate,
              paymentIntentId,
            });

            const response = await fetch("/api/payment-intent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: cart.map((item) => ({
                  ...item,
                  variant_id: item.variant_id,
                  quantity: item.quantity,
                  price: item.price,
                })),
                shipping_rate: shippingRate,
                paymentIntentId,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(
                errorData.message || "Failed to update payment intent"
              );
            }

            const data = await response.json();
            console.log("Payment intent updated:", data);
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
