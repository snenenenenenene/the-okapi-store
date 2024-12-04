'use client';

import { useCartStore } from '@/store/cartStore';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { cart, getTotalPrice, getSubtotal, getShippingCost, getDiscount } = useCartStore();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState('contact');

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart.length, router]);

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-vintage-black">
      <main className="flex-1">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2">
          {/* Left column */}
          <div className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-lg">
              <Elements
                stripe={stripePromise}
                options={{
                  mode: 'payment',
                  currency: 'eur',
                  amount: Math.round(getTotalPrice() * 100),
                }}
              >
                <CheckoutForm
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                />
              </Elements>
            </div>
          </div>

          {/* Right column */}
          <div className="bg-stone-900/50 px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-lg">
              <h2 className="text-lg font-medium text-stone-200">Order summary</h2>

              <div className="mt-6">
                <div className="flow-root">
                  <ul role="list" className="-my-6 divide-y divide-stone-800">
                    {cart.map((product) => (
                      <li key={product.id} className="flex space-x-6 py-6">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-24 w-24 flex-none rounded-md bg-stone-800 object-cover object-center"
                        />
                        <div className="flex-auto">
                          <div className="space-y-1">
                            <h3 className="text-sm font-medium text-stone-200">{product.name}</h3>
                            <p className="text-sm text-stone-500">Quantity: {product.quantity}</p>
                          </div>
                          <div className="mt-2 flex items-center">
                            <p className="text-sm font-medium text-stone-200">
                              €{(product.price * product.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10 space-y-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-stone-500">Subtotal</p>
                    <p className="text-sm font-medium text-stone-200">€{getSubtotal().toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-stone-500">Shipping</p>
                    <p className="text-sm font-medium text-stone-200">€{getShippingCost().toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-stone-500">Discount</p>
                    <p className="text-sm font-medium text-stone-200">-€{getDiscount().toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between border-t border-stone-800 pt-4">
                    <p className="text-base font-medium text-stone-200">Order total</p>
                    <p className="text-base font-medium text-stone-200">€{getTotalPrice().toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}