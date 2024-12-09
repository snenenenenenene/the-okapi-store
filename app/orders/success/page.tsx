'use client';

import { useCartStore } from '@/store/cartStore';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart, clearCheckoutData } = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const paymentIntentId = searchParams.get('payment_intent');
        const status = searchParams.get('redirect_status');

        if (!paymentIntentId || status !== 'succeeded') {
          throw new Error('Payment was not successful');
        }

        // Fetch order by payment intent ID
        const response = await fetch(`/api/orders/by-payment/${paymentIntentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const order = await response.json();
        console.log('Found order:', order);

        // Clear cart and checkout data
        clearCart();
        clearCheckoutData();

        // Redirect to order details
        router.push(`/orders/${order.id}`);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        
        // If there's an error, redirect to cart after 5 seconds
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [searchParams, router, clearCart, clearCheckoutData]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-500 text-sm">Redirecting you to products in 5 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {isLoading ? 'Processing your order...' : 'Order confirmed!'}
        </h1>
        <p className="text-gray-600">
          {isLoading
            ? 'Please wait while we process your order...'
            : 'Redirecting you to your order details...'}
        </p>
      </div>
    </div>
  );
}
