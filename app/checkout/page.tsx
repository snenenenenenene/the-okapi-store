'use client';

import { useCartStore } from '@/store/cartStore';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CheckoutForm from './CheckoutForm';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
	const [clientSecret, setClientSecret] = useState<string>();
	const { cart } = useCartStore();
	const router = useRouter();

	useEffect(() => {
		if (cart.length === 0) {
			router.push('/cart');
			return;
		}

		const createInitialPaymentIntent = async () => {
			try {
				const response = await fetch('/api/payment-intent', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						items: cart
					}),
				});

				if (!response.ok) {
					throw new Error('Failed to create payment intent');
				}

				const data = await response.json();
				setClientSecret(data.clientSecret);
			} catch (error) {
				console.error('Initial payment intent error:', error);
			}
		};

		createInitialPaymentIntent();
	}, [cart, router]);

	if (cart.length === 0) return null;

	if (!clientSecret) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-neutral-50 py-12">
			<Elements
				stripe={stripePromise}
				options={{
					clientSecret,
					appearance: {
						theme: 'stripe',
						variables: {
							colorPrimary: '#8D6E63',
							borderRadius: '8px',
							fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
							colorBackground: '#ffffff',
						},
					},
				}}
			>
				<CheckoutForm />
			</Elements>
		</div>
	);
}