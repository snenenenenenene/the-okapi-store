'use client';

import { useCartStore } from '@/store/cartStore';
import {
  AddressElement,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutFormProps {
  activeStep: string;
  setActiveStep: (step: string) => void;
}

export default function CheckoutForm({ activeStep, setActiveStep }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<any>(null);
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    contact?: string;
    shipping?: string;
    payment?: string;
  }>({});

  const createPaymentIntent = async () => {
    try {
      const formattedItems = cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: formattedItems,
          currency: 'eur',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }
      return data.clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!stripe || !elements) {
      console.error('Stripe.js has not loaded');
      return;
    }

    setIsLoading(true);

    try {
      if (activeStep === 'contact') {
        if (!email) {
          setValidationErrors({ contact: 'Email is required' });
          return;
        }
        setActiveStep('shipping');
      } else if (activeStep === 'shipping') {
        if (!address) {
          setValidationErrors({ shipping: 'Shipping address is required' });
          return;
        }
        setActiveStep('payment');
        // Create payment intent when moving to payment step
        const secret = await createPaymentIntent();
        setClientSecret(secret);
      } else if (activeStep === 'payment') {
        if (!clientSecret) {
          setValidationErrors({ payment: 'Payment setup failed' });
          return;
        }

        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/order/confirmation`,
          },
        });

        if (error) {
          setValidationErrors({ payment: error.message || 'Payment failed' });
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setValidationErrors(prev => ({ ...prev, payment: 'An unexpected error occurred' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <AnimatePresence mode="wait">
        {activeStep === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-medium text-stone-200">Contact Information</h2>
            <div className="rounded-lg border border-stone-800 bg-stone-900/50 p-4">
              <LinkAuthenticationElement
                onChange={(event) => {
                  if (event.complete) {
                    setEmail(event.value.email);
                  }
                }}
                options={{
                  defaultValues: {
                    email: email,
                  },
                }}
              />
            </div>
            {validationErrors.contact && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.contact}
              </div>
            )}
          </motion.div>
        )}

        {activeStep === 'shipping' && (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-medium text-stone-200">Shipping Address</h2>
            <div className="rounded-lg border border-stone-800 bg-stone-900/50 p-4">
              <AddressElement
                onChange={(event) => {
                  if (event.complete) {
                    setAddress(event.value);
                  }
                }}
                options={{
                  mode: 'shipping',
                  allowedCountries: ['BE', 'NL', 'LU', 'DE', 'FR'],
                }}
              />
            </div>
            {validationErrors.shipping && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.shipping}
              </div>
            )}
          </motion.div>
        )}

        {activeStep === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-medium text-stone-200">Payment</h2>
            <div className="rounded-lg border border-stone-800 bg-stone-900/50 p-4">
              <PaymentElement />
            </div>
            {validationErrors.payment && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.payment}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-stone-200 px-6 py-2 text-sm font-medium text-vintage-black transition-colors hover:bg-stone-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {activeStep === 'payment' ? 'Pay Now' : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}