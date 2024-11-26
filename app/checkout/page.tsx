'use client';

import { useCartStore } from '@/store/cartStore';
import { AddressElement, Elements, LinkAuthenticationElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertCircle, ArrowLeft, Loader2, Lock, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const appearance = {
	theme: 'stripe',
	variables: {
		colorPrimary: '#8D6E63',
		colorBackground: '#ffffff',
		colorText: '#1f2937',
		fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue"',
		borderRadius: '0.5rem',
	},
};

interface ShippingRate {
	id: string;
	name: string;
	rate: number;
	min_delivery_days: number;
	max_delivery_days: number;
}

interface ShippingAddress {
	line1: string;
	line2?: string;
	city: string;
	state: string;
	country: string;
	postal_code: string;
}

function useCheckoutFlow() {
	const stripe = useStripe();
	const elements = useElements();
	const [email, setEmail] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
	const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
	const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
	const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
	const { cart, clearCart } = useCartStore();
	const router = useRouter();

	const handleAddressChange = async (event: any) => {
		if (event.complete && event.value?.address) {
			const address = event.value;
			setIsCalculatingShipping(true);

			try {
				// Format address from Stripe AddressElement
				const shippingAddress = {
					address1: address.address.line1,
					address2: address.address.line2 || '',
					city: address.address.city,
					state: address.address.state || address.address.city, // Some countries don't have states
					country: address.address.country,
					zip: address.address.postal_code
				};

				console.log('Sending address to shipping calculation:', shippingAddress);

				const response = await fetch('/api/printful/shipping-rates', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						address: shippingAddress,
						items: cart.map(item => ({
							variant_id: item.variant_id,
							quantity: item.quantity,
							price: item.price
						}))
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.details || 'Failed to calculate shipping');
				}

				const rates = await response.json();
				console.log('Received shipping rates:', rates);

				if (!Array.isArray(rates) || rates.length === 0) {
					throw new Error('No shipping rates available for this address');
				}

				setShippingRates(rates);
				setSelectedRate(rates[0]); // Select cheapest rate by default

				// Update payment intent with shipping
				const paymentIntentResponse = await fetch('/api/payment-intent', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						items: cart,
						shipping_rate: rates[0],
						paymentIntentId,
					}),
				});

				const data = await paymentIntentResponse.json();
				if (data.paymentIntentId) {
					setPaymentIntentId(data.paymentIntentId);
				}
			} catch (error) {
				console.error('Error calculating shipping:', error);
				setError(error instanceof Error ? error.message : 'Failed to calculate shipping');
			} finally {
				setIsCalculatingShipping(false);
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements || !selectedRate) {
			return;
		}

		setIsProcessing(true);
		setError(null);

		try {
			const { error: validationError } = await elements.submit();
			if (validationError) {
				throw new Error(validationError.message);
			}

			const response = await fetch('/api/payment-intent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: cart,
					shipping_rate: selectedRate,
					paymentIntentId,
				}),
			});

			const { clientSecret, error: backendError } = await response.json();
			if (backendError) throw new Error(backendError);

			const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
				elements,
				clientSecret,
				// redirect: 'if_required',
				confirmParams: {
					return_url: `${window.location.origin}/checkout/success`,
					payment_method_data: {
						billing_details: {
							email: email,
						}
					},
				},
			});

			if (confirmError) {
				throw new Error(confirmError.message);
			}

			if (paymentIntent.status === 'succeeded') {
				const orderResponse = await fetch('/api/orders', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						paymentIntentId: paymentIntent.id,
						items: cart,
						shipping: selectedRate,
					}),
				});

				if (!orderResponse.ok) {
					throw new Error('Failed to create order');
				}

				const { orderId } = await orderResponse.json();
				clearCart();
				router.push(`/orders/${orderId}`);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsProcessing(false);
		}
	};

	return {
		email,
		setEmail,
		error,
		isProcessing,
		isCalculatingShipping,
		shippingRates,
		selectedRate,
		setSelectedRate,
		handleAddressChange,
		handleSubmit,
	};
}

function OrderSummary({
	items,
	selectedRate,
}: {
	items: any[];
	selectedRate?: ShippingRate | null;
}) {
	const subtotal = items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);
	const shipping = selectedRate ? Number(selectedRate.rate) : 0;
	const total = subtotal + shipping;

	return (
		<div className="bg-white rounded-lg shadow-sm p-6">
			<h2 className="text-lg font-semibold mb-4">Order Summary</h2>
			<div className="space-y-4">
				{items.map((item) => (
					<div key={item.id} className="flex items-center gap-4">
						<div className="relative w-16 h-16">
							<Image
								src={item.image}
								alt={item.name}
								fill
								className="object-cover rounded"
							/>
						</div>
						<div className="flex-1">
							<p className="font-medium">{item.name}</p>
							<p className="text-sm text-neutral-500">
								Quantity: {item.quantity}
							</p>
						</div>
						<p className="font-medium">
							€{(item.price * item.quantity).toFixed(2)}
						</p>
					</div>
				))}

				<div className="border-t pt-4 mt-4 space-y-2">
					<div className="flex justify-between text-sm">
						<span>Subtotal</span>
						<span>€{subtotal.toFixed(2)}</span>
					</div>
					{selectedRate && (
						<div className="flex justify-between text-sm">
							<span>Shipping ({selectedRate.name})</span>
							<span>€{Number(selectedRate.rate).toFixed(2)}</span>
						</div>
					)}
					<div className="flex justify-between font-semibold text-lg pt-2 border-t">
						<span>Total</span>
						<span>€{total.toFixed(2)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function CheckoutForm() {
	const {
		email,
		setEmail,
		error,
		isProcessing,
		isCalculatingShipping,
		shippingRates,
		selectedRate,
		setSelectedRate,
		handleAddressChange,
		handleSubmit,
	} = useCheckoutFlow();

	const { cart } = useCartStore();

	const canProceed = Boolean(email && selectedRate && !isCalculatingShipping);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<div className="order-2 lg:order-1">
				<form onSubmit={handleSubmit} className="space-y-8">
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold mb-4">Contact Information</h3>
						<LinkAuthenticationElement
							options={{
								defaultValues: { email },
							}}
							onChange={(event) => {
								if (event.value.email) {
									setEmail(event.value.email);
								}
							}}
						/>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
						<AddressElement
							options={{
								mode: 'shipping',
								allowedCountries: ['BE', 'NL', 'LU', 'DE', 'FR'],
								blockPoBox: true,
							}}
							onChange={handleAddressChange}
						/>
					</div>

					{error && (
						<div className="bg-error/10 text-error p-4 rounded-lg flex items-center gap-2">
							<AlertCircle className="w-5 h-5" />
							{error}
						</div>
					)}

					{shippingRates.length > 0 && (
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h3 className="text-lg font-semibold mb-4">Payment Details</h3>
							<PaymentElement />
						</div>
					)}

					{shippingRates.length > 0 && (
						<button
							type="submit"
							disabled={!canProceed || isProcessing}
							className="w-full btn btn-primary btn-lg gap-2"
						>
							{isProcessing ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									Processing...
								</>
							) : (
								<>
									<Lock className="w-5 h-5" />
									Complete Order
								</>
							)}
						</button>
					)}
				</form>
			</div>

			<div className="order-1 lg:order-2 space-y-6">
				<OrderSummary items={cart} selectedRate={selectedRate} />

				{isCalculatingShipping ? (
					<div className="bg-white rounded-lg p-6 flex items-center justify-center">
						<Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
						<span>Calculating shipping rates...</span>
					</div>
				) : shippingRates.length > 0 && (
					<div className="bg-primary/5 rounded-lg p-6">
						<div className="flex items-center gap-3 mb-4">
							<Truck className="w-5 h-5 text-primary" />
							<h3 className="font-medium">Shipping Method</h3>
						</div>
						<div className="space-y-4">
							{shippingRates.map((rate) => (
								<label
									key={rate.id}
									className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${selectedRate?.id === rate.id
										? 'border-primary bg-primary/5'
										: 'hover:bg-base-200'
										}`}
								>
									<div className="flex items-center gap-4">
										<input
											type="radio"
											name="shipping_rate"
											checked={selectedRate?.id === rate.id}
											onChange={() => setSelectedRate(rate)}
											className="radio radio-primary"
										/>
										<div>
											<p className="font-medium">{rate.name}</p>
											<p className="text-sm text-neutral-600">
												{rate.min_delivery_days}-{rate.max_delivery_days} business days
											</p>
										</div>
									</div>
									<span className="font-semibold">
										€{Number(rate.rate).toFixed(2)}
									</span>
								</label>
							))}
						</div>
					</div>
				)}

				<div className="bg-base-100 rounded-lg p-4 space-y-2">
					<div className="flex items-center gap-2 text-sm text-neutral-600">
						<Lock className="w-4 h-4" />
						<span>Secure checkout powered by Stripe</span>
					</div>
					<div className="flex items-center gap-2 text-sm text-neutral-600">
						<Truck className="w-4 h-4" />
						<span>Free shipping on orders over €100</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function CheckoutPage() {
	const { cart, getTotalPrice } = useCartStore();
	const router = useRouter();

	useEffect(() => {
		if (cart.length === 0) {
			router.push('/');
		}
	}, [cart.length, router]);

	if (cart.length === 0) {
		return null;
	}

	const amount = Math.round(getTotalPrice() * 100);

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="container mx-auto px-4 max-w-6xl">
				<div className="flex items-center mb-8">
					<Link href="/cart" className="flex items-center text-sm text-neutral-600 hover:text-neutral-900">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Return to cart
					</Link>
				</div>

				<Elements
					stripe={stripePromise}
					options={{
						appearance,
						mode: 'payment',
						currency: 'eur',
						amount,
						paymentMethodCreation: 'manual',
					}}
				>
					<CheckoutForm />
				</Elements>
			</div>
		</div>
	);
}