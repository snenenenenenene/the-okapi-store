// /app/checkout/page.tsx
'use client';

import { useCartStore } from '@/store/cartStore';
import {
	AddressElement,
	Elements,
	useElements,
	useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const appearance = {
	theme: 'stripe',
	variables: {
		colorPrimary: '#8D6E63',
		colorBackground: '#FFFFFF',
		colorText: '#1f2937',
		fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
		borderRadius: '8px',
	},
};

interface ShippingAddress {
	name: string;
	address: {
		line1: string;
		line2?: string;
		city: string;
		state: string;
		postal_code: string;
		country: string;
	};
	email: string;
	phone: string;
}

function CheckoutForm() {
	const { cart, getTotalPrice } = useCartStore();
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [shippingRate, setShippingRate] = useState<number | null>(null);
	const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
	const [validatedAddress, setValidatedAddress] = useState<ShippingAddress | null>(null);
	const stripe = useStripe();
	const elements = useElements();
	const { data: session } = useSession();

	const calculateShipping = async (addressData: any) => {
		if (!addressData.complete) return;

		setIsCalculatingShipping(true);
		setShippingRate(null);

		try {
			const response = await fetch('/api/printful/shipping-rates', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					address: {
						name: addressData.value.name,
						address1: addressData.value.address.line1,
						address2: addressData.value.address.line2,
						city: addressData.value.address.city,
						state: addressData.value.address.state,
						country: addressData.value.address.country,
						zip: addressData.value.address.postal_code,
					},
					items: cart,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to calculate shipping');
			}

			const rates = await response.json();
			if (!rates.length) {
				throw new Error('No shipping rates available for this address');
			}

			setShippingRate(rates[0].rate);
			setValidatedAddress(addressData.value);
			setError(null);

		} catch (err) {
			console.error('Shipping calculation error:', err);
			setError(err instanceof Error ? err.message : 'Failed to calculate shipping');
			setShippingRate(null);
			setValidatedAddress(null);
		} finally {
			setIsCalculatingShipping(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements) {
			setError('Payment system not initialized.');
			return;
		}

		if (!validatedAddress || !shippingRate) {
			setError('Please complete shipping information.');
			return;
		}

		setIsProcessing(true);
		setError(null);

		try {
			// Create checkout session with validated address and shipping
			const response = await fetch('/api/stripe/create-checkout-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					items: cart,
					shipping: {
						name: validatedAddress.name,
						email: validatedAddress.email,
						phone: validatedAddress.phone,
						address: {
							line1: validatedAddress.address.line1,
							line2: validatedAddress.address.line2,
							city: validatedAddress.address.city,
							state: validatedAddress.address.state,
							postal_code: validatedAddress.address.postal_code,
							country: validatedAddress.address.country,
						},
						cost: shippingRate,
					},
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to create checkout session');
			}

			const { sessionId } = await response.json();

			// Redirect to Stripe Checkout
			const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

			if (stripeError) {
				throw new Error(stripeError.message);
			}

		} catch (err) {
			console.error('Checkout error:', err);
			setError(err instanceof Error ? err.message : 'An error occurred during checkout');
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			{/* Order Summary */}
			<div className="bg-base-100 rounded-lg p-6 shadow-sm">
				<h2 className="text-xl font-semibold mb-4">Order Summary</h2>
				<div className="space-y-4">
					{cart.map(item => (
						<div key={item.id} className="flex justify-between items-center">
							<div className="flex items-center gap-4">
								<img
									src={item.image}
									alt={item.name}
									className="w-16 h-16 object-cover rounded"
								/>
								<div>
									<p className="font-medium">{item.name}</p>
									<p className="text-sm text-base-content/70">
										Quantity: {item.quantity}
									</p>
								</div>
							</div>
							<p className="font-medium">€{(item.price * item.quantity).toFixed(2)}</p>
						</div>
					))}

					<div className="border-t border-base-300 mt-4 pt-4 space-y-2">
						<div className="flex justify-between items-center">
							<span>Subtotal</span>
							<span>€{getTotalPrice().toFixed(2)}</span>
						</div>
						<div className="flex justify-between items-center">
							<span>Shipping</span>
							{isCalculatingShipping ? (
								<span className="flex items-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" />
									Calculating...
								</span>
							) : shippingRate ? (
								<span>€{(shippingRate / 100).toFixed(2)}</span>
							) : (
								<span className="text-base-content/70">Enter address to calculate</span>
							)}
						</div>
						{shippingRate && (
							<div className="flex justify-between items-center font-bold text-lg pt-2">
								<span>Total</span>
								<span>€{((getTotalPrice() * 100 + shippingRate) / 100).toFixed(2)}</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Shipping Information */}
			<div className="bg-base-100 rounded-lg p-6 shadow-sm">
				<h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
				<AddressElement
					options={{
						mode: 'shipping',
						allowedCountries: ['BE', 'NL', 'LU', 'DE', 'FR'],
						fields: {
							phone: 'always',
						},
						validation: {
							phone: {
								required: 'always',
							},
						},
						defaultValues: {
							name: session?.user?.name || '',
							email: session?.user?.email || '',
						},
					}}
					onChange={(event) => {
						if (event.complete) {
							calculateShipping(event);
						}
					}}
				/>
			</div>

			{error && (
				<div className="bg-error/10 text-error px-4 py-3 rounded-lg">
					{error}
				</div>
			)}

			<button
				type="submit"
				className="btn btn-primary w-full"
				disabled={isProcessing || !shippingRate || isCalculatingShipping || !validatedAddress}
			>
				{isProcessing ? (
					<>
						<Loader2 className="w-4 h-4 animate-spin mr-2" />
						Processing...
					</>
				) : (
					`Proceed to Payment • €${((getTotalPrice() * 100 + (shippingRate || 0)) / 100).toFixed(2)}`
				)}
			</button>
		</form>
	);
}

export default function CheckoutPage() {
	const { cart } = useCartStore();
	const router = useRouter();

	useEffect(() => {
		if (cart.length === 0) {
			router.push('/');
		}
	}, [cart.length, router]);

	if (cart.length === 0) {
		return null;
	}

	return (
		<Elements
			stripe={stripePromise}
			options={{
				appearance,
				mode: 'payment',
				currency: 'eur',
				paymentMethodCreation: 'manual'
			}}
		>
			<div className="min-h-screen bg-base-100 py-12">
				<div className="container mx-auto px-4 max-w-4xl">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-8"
					>
						<h1 className="text-3xl font-bold">Checkout</h1>
						<CheckoutForm />
					</motion.div>
				</div>
			</div>
		</Elements>
	);
}