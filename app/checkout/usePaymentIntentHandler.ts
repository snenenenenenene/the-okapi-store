// app/checkout/usePaymentIntentHandler.ts
import { useCallback, useRef, useState, useEffect } from "react";

export interface PaymentIntentError extends Error {
  code?: string;
  decline_code?: string;
}

export interface CartItem {
  id: string;
  variant_id: string;
  quantity: number;
  price: number;
  name: string;
  size: string;
  image: string;
}

export interface ShippingRate {
  id: string;
  rate: number;
}

function usePaymentIntentHandler() {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const lastRequestRef = useRef<string>();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return useCallback(
    async (cart: CartItem[], shippingRate: ShippingRate, paymentIntentId: string | null) => {
      try {
        setIsProcessing(true);

        // Validate cart items
        if (cart.some((item) => !item.variant_id)) {
          throw new Error("All cart items must have variant_id");
        }

        const requestKey = JSON.stringify({ cart, shippingRate });
        if (requestKey === lastRequestRef.current) {
          return null;
        }

        // Cancel any pending requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        lastRequestRef.current = requestKey;

        return await new Promise((resolve, reject) => {
          timeoutRef.current = setTimeout(async () => {
            try {
              const response = await fetch("/api/payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  items: cart.map((item) => ({
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                  shipping_rate: shippingRate,
                  paymentIntentId,
                }),
                signal: abortControllerRef.current?.signal,
              });

              if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(errorData.message || "Failed to update payment intent") as PaymentIntentError;
                error.code = errorData.code;
                error.decline_code = errorData.decline_code;
                throw error;
              }

              const data = await response.json();
              if (!data.clientSecret) {
                throw new Error("Invalid response: missing client secret");
              }

              resolve(data);
            } catch (error) {
              if (error instanceof Error) {
                console.error("Payment intent update error:", error);
                reject(error);
              } else {
                reject(new Error("Unknown error occurred"));
              }
            }
          }, 500);
        });
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Unknown error occurred");
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );
}

export default usePaymentIntentHandler;
