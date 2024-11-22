// app/checkout/page.tsx
'use client'

import { useCartStore } from '@/store/cartStore';
import { AddressElement, Elements, LinkAuthenticationElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const appearance = {
	theme: 'stripe',
	variables: {
		colorPrimary: '#8D6E63',
		borderRadius: '8px',
		fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
		colorBackground: '#ffffff',
	},
};

interface ShippingRate {
	id: string;
	name: string;
	rate: number;
	min_delivery_days: number;
	max_delivery_days: number;
}

function CheckoutForm() {
	const stripe = useStripe();
	const elements = useElements();
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
	const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
	const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
	const [address, setAddress] = useState<any>(null);
	const router = useRouter();
	const { cart, clearCart, getTotalPrice } = useCartStore();

	const calculateShipping = async (address: any) => {
		console.log('Calculating shipping rates...');

		if (!address?.country) return;
		setIsCalculatingShipping(true);
		setShippingRates([]);
		setSelectedRate(null);

		console.log(address)

		try {
			const response = await fetch('/api/printful/shipping-rates', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					address: {
						address1: address.line1,
						address2: address.line2,
						city: address.city,
						state: address.state,
						country: address.country,
						zip: address.postal_code,
						phone: address.phone,
					},
					items: cart
				}),
			});

			console.log(response)
			if (!response.ok) {
				throw new Error('Failed to calculate shipping');
			}

			const rates = await response.json();
			console.log(rates)
			setShippingRates(rates);

			// Select cheapest rate by default
			if (rates.length > 0) {
				const cheapestRate = rates.reduce((prev: ShippingRate, curr: ShippingRate) =>
					prev.rate < curr.rate ? prev : curr
				);
				setSelectedRate(cheapestRate);
			}
		} catch (error) {
			console.error('Shipping calculation error:', error);
			setMessage('Failed to calculate shipping rates. Please try again.');
		} finally {
			setIsCalculatingShipping(false);
		}
	};

	const handleAddressChange = async (event: any) => {
		console.log('Address Event:', event);

		// Check if we have all required fields for shipping calculation
		const addressComplete = event.value &&
			event.value.address?.country &&
			event.value.address?.postal_code &&
			event.value.address?.city;

		if (addressComplete) {
			const newAddress = event.value;
			setAddress(newAddress);
			await calculateShipping(newAddress.address);
		}
	};

	useEffect(() => {
		if (!stripe) return;

		const clientSecret = new URLSearchParams(window.location.search).get(
			"payment_intent_client_secret"
		);

		if (!clientSecret) return;

		stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
			switch (paymentIntent?.status) {
				case "succeeded":
					setMessage("Payment succeeded!");
					break;
				case "processing":
					setMessage("Your payment is processing.");
					break;
				case "requires_payment_method":
					setMessage("Please provide payment details.");
					break;
				default:
					setMessage("Something went wrong.");
					break;
			}
		});
	}, [stripe]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements || !selectedRate || !address) {
			setMessage('Please complete all required fields');
			return;
		}

		setIsLoading(true);

		try {
			// Update payment intent with final amount including shipping
			const updateResponse = await fetch('/api/payment-intent/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					payment_intent_id: localStorage.getItem('payment_intent_id'),
					shipping_rate: selectedRate,
					amount: getTotalPrice() + selectedRate.rate,
					shipping_address: address,
				}),
			});

			if (!updateResponse.ok) {
				throw new Error('Failed to update payment intent');
			}

			const { error } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/checkout/success`,
					receipt_email: email,
					shipping: {
						address: {
							line1: address.address.line1,
							line2: address.address.line2 || '',
							city: address.address.city,
							state: address.address.state,
							postal_code: address.address.postal_code,
							country: address.address.country,
						},
						name: `${address.name}`,
						phone: address.phone,
						carrier: selectedRate.name,
					},
				},
			});

			if (error) {
				if (error.type === "card_error" || error.type === "validation_error") {
					setMessage(error.message || "An error occurred");
				} else {
					setMessage("An unexpected error occurred.");
				}
			} else {
				clearCart();
				localStorage.removeItem('payment_intent_id');
			}
		} catch (error) {
			console.error('Payment error:', error);
			setMessage("Failed to process payment.");
		} finally {
			setIsLoading(false);
		}
	};

	const subtotal: number = getTotalPrice();
	const shippingCost = selectedRate?.rate || 0;
	const total = (Number(subtotal) + Number(shippingCost)).toFixed(2);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
			{/* Order Summary */}
			<div>
				<h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
				<div className="space-y-4">
					{cart.map(item => (
						<div key={item.id} className="flex gap-4 border-b pb-4">
							<div className="relative w-20 h-20">
								<Image
									src={item.image}
									alt={item.name}
									fill
									className="object-cover rounded-md"
								/>
							</div>
							<div className="flex-1">
								<h3 className="font-medium">{item.name}</h3>
								<p className="text-sm text-neutral-500">Quantity: {item.quantity}</p>
								<p className="font-medium">€{(item.price * item.quantity).toFixed(2)}</p>
							</div>
						</div>
					))}

					<div className="bg-base-100 p-6 rounded-lg space-y-4">
						<div className="flex justify-between">
							<span>Subtotal</span>
							<span>€{subtotal}</span>
						</div>
						{selectedRate && (
							<div className="flex justify-between text-neutral-600">
								<span>Shipping ({selectedRate.name})</span>
								<span>€{shippingCost}</span>
							</div>
						)}
						<div className="border-t pt-4">
							<div className="flex justify-between font-bold text-lg">
								<span>Total</span>
								<span>€{total}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Payment Form */}
			<form onSubmit={handleSubmit} className="space-y-8">
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">Contact Information</h2>
					<LinkAuthenticationElement
						options={{
							defaultValues: {
								email: email,
							},
						}}
						onChange={(e) => setEmail(e.value.email)}
					/>
				</div>

				<div className="space-y-4">
					<h2 className="text-xl font-semibold">Shipping Address</h2>
					<AddressElement
						options={{
							mode: 'shipping',
							allowedCountries: ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE'],
							fields: {
								phone: 'always',
							},
							validation: {
								phone: {
									required: 'always',
								},
							},
							display: {
								name: 'split',
							},
							autocomplete: {
								mode: 'automatic',
							},
						}}
						onChange={handleAddressChange}
					/>
				</div>

				{isCalculatingShipping ? (
					<div className="flex items-center justify-center p-4 bg-base-200 rounded-lg">
						<Loader2 className="w-5 h-5 animate-spin mr-2" />
						<span>Calculating shipping rates...</span>
					</div>
				) : shippingRates.length > 0 && (
					<div className="space-y-4">
						<h2 className="text-xl font-semibold">Shipping Method</h2>
						{shippingRates.map((rate) => (
							<label
								key={rate.id}
								className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors
                  ${selectedRate?.id === rate.id ? 'border-primary bg-primary/5' : 'hover:bg-base-200'}`}
							>
								<input
									type="radio"
									name="shipping_rate"
									checked={selectedRate?.id === rate.id}
									onChange={() => setSelectedRate(rate)}
									className="radio radio-primary"
								/>
								<div className="flex-1">
									<div className="font-medium">{rate.name}</div>
									<div className="text-sm text-neutral-500">
										{rate.min_delivery_days}-{rate.max_delivery_days} business days
									</div>
								</div>
								<div className="font-semibold">
									€{rate.rate}
								</div>
							</label>
						))}
					</div>
				)}

				<div className="space-y-4">
					<h2 className="text-xl font-semibold">Payment Details</h2>
					<PaymentElement />
				</div>

				{message && (
					<div className="bg-error/10 text-error p-4 rounded-lg">
						{message}
					</div>
				)}

				<button
					type="submit"
					disabled={!stripe || isLoading || !selectedRate}
					className="btn btn-primary w-full"
				>
					{isLoading ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin mr-2" />
							Processing...
						</>
					) : (
						`Pay €${total}`
					)}
				</button>
			</form>
		</div>
	);
}

export default function CheckoutPage() {
	const [clientSecret, setClientSecret] = useState<string>();
	const { cart, getTotalPrice } = useCartStore();
	const router = useRouter();

	useEffect(() => {
		if (cart.length === 0) {
			router.push('/');
			return;
		}

		// Create PaymentIntent as soon as the page loads
		fetch('/api/payment-intent', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				items: cart,
				payment_intent_id: localStorage.getItem('payment_intent_id'),
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				setClientSecret(data.clientSecret);
				localStorage.setItem('payment_intent_id', data.payment_intent_id);
			});
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
		<div className="min-h-screen bg-base-100">
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">Checkout</h1>

				<Elements
					stripe={stripePromise}
					options={{
						clientSecret,
						appearance,
						locale: 'auto',
					}}
				>
					<CheckoutForm />
				</Elements>
			</div>
		</div>
	);
}