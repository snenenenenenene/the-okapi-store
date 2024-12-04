'use client';

import { useCartStore } from '@/store/cartStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { XCircle, Check } from '@/components/icons';
import { motion } from 'framer-motion';

function CheckoutSuccessContent() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    const fetchOrderId = async () => {
      const paymentIntentId = searchParams.get('payment_intent');
      console.log('Payment Intent ID:', paymentIntentId);

      if (!paymentIntentId) {
        setError('No payment intent ID found');
        setIsLoading(false);
        return;
      }

      try {
        // First verify the payment status with Stripe
        const verifyResponse = await fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
          }),
        });

        if (!verifyResponse.ok) {
          throw new Error('Payment verification failed');
        }

        const { status } = await verifyResponse.json();
        if (status !== 'succeeded') {
          throw new Error('Payment not completed');
        }

        // Now fetch the order details
        console.log('Fetching order for payment intent:', paymentIntentId);
        const response = await fetch(`/api/orders/lookup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: paymentIntentId,
          }),
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.order?.id) {
          setOrderConfirmed(true);
          // Only clear cart after confirming order exists
          clearCart();
          // Add a small delay for animation
          await new Promise(resolve => setTimeout(resolve, 800));
          console.log('Redirecting to order:', data.order.id);
          router.replace(`/orders/${data.order.id}`);
        } else {
          setError('Order not found in response');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(error instanceof Error ? error.message : 'Error fetching order');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderId();
  }, [clearCart, searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-base-200 rounded-lg max-w-md mx-auto transform hover:scale-[1.01] transition-all duration-300">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-error" />
          </div>
          <p className="text-lg text-error font-medium">{error}</p>
          <p className="text-base-content/70">This has been logged for debugging.</p>
          <div className="pt-4">
            <button 
              onClick={() => router.push('/cart')}
              className="btn btn-primary w-full"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className={`text-center space-y-6 transform transition-all duration-500 ${orderConfirmed ? 'scale-105 opacity-0' : ''}`}>
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
          {orderConfirmed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <Check className="w-8 h-8 text-success" />
              </motion.div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xl font-medium">
            {orderConfirmed ? 'Order Confirmed!' : 'Processing your order...'}
          </p>
          <p className="text-base-content/70">
            {orderConfirmed 
              ? 'Redirecting you to your order details...'
              : 'Please wait while we confirm your payment...'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return <CheckoutSuccessContent />;
}