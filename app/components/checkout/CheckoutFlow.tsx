// /components/checkout/CheckoutFlow.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckoutSteps } from "./CheckoutSteps";
import { ShippingForm } from "./ShippingForm";
import { OrderReview } from "./OrderReview";
import { PaymentStep } from "./PaymentStep";
import { useCheckout } from "./CheckoutContext";
import { Loader2 } from "lucide-react";

export function CheckoutFlow() {
  const { state } = useCheckout();

  return (
    <div className="space-y-8">
      <CheckoutSteps />

      {state.error && (
        <div className="bg-error/10 text-error px-4 py-3 rounded-lg">
          {state.error}
        </div>
      )}

      {state.isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-8 rounded-lg flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-lg">Processing your order...</p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {state.step === "shipping" && (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ShippingForm />
          </motion.div>
        )}

        {state.step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <OrderReview />
          </motion.div>
        )}

        {state.step === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PaymentStep />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}