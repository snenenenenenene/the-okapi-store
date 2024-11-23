'use client';

import { useCartStore } from '@/store/cartStore';
import { AddressElement, LinkAuthenticationElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { AlertCircle, ArrowLeft, Loader2, Lock, Shield, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import usePaymentIntentHandler from './usePaymentIntentHandler';

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
	const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
	const updatePaymentIntent = usePaymentIntentHandler();
	const submitAttempted = useRef(false);

	const calculateShipping = useCallback(async (shippingAddress: any) => {
		if (!shippingAddress?.country) return;

		setIsCalculatingShipping(true);
		setShippingRates([]);
		setSelectedRate(null);

		try {
			const response = await fetch('/api/printful/shipping-rates', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					address: {
						address1: shippingAddress.line1,
						address2: shippingAddress.line2,
						city: shippingAddress.city,
						state: shippingAddress.state,
						country: shippingAddress.country,
						zip: shippingAddress.postal_code,
					},
					items: cart
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to calculate shipping');
			}

			const rates = await response.json();
			setShippingRates(rates);

			if (rates.length > 0) {
				const cheapestRate = rates.reduce((prev: ShippingRate, curr: ShippingRate) =>
					prev.rate < curr.rate ? prev : curr
				);
				setSelectedRate(cheapestRate);

				const result = await updatePaymentIntent(cart, cheapestRate, paymentIntentId);
				if (result?.paymentIntentId) {
					setPaymentIntentId(result.paymentIntentId);
				}
			}
		} catch (error) {
			setMessage('Failed to calculate shipping rates. Please try again.');
		} finally {
			setIsCalculatingShipping(false);
		}
	}, [cart, paymentIntentId, updatePaymentIntent]);

	const handleAddressChange = useCallback((event: any) => {
		const newAddress = event.value;
		setAddress(newAddress);

		if (newAddress?.address?.country &&
			newAddress?.address?.postal_code &&
			newAddress?.address?.city) {
			calculateShipping(newAddress.address);
		}
	}, [calculateShipping]);

	const handleShippingRateChange = async (rate: ShippingRate) => {
		if (rate.id === selectedRate?.id) return;

		setSelectedRate(rate);
		console.log('Updating payment intent for new shipping rate:', {
			rateId: rate.id,
			cost: rate.rate,
			currentPaymentIntentId: paymentIntentId
		});

		const result = await updatePaymentIntent(cart, rate, paymentIntentId);

		console.log('Shipping rate update result:', {
			success: !!result,
			hasClientSecret: !!result?.clientSecret,
			hasPaymentIntentId: !!result?.paymentIntentId
		});

		if (result?.paymentIntentId) {
			setPaymentIntentId(result.paymentIntentId);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (submitAttempted.current) {
			console.log('Preventing duplicate submission');
			return;
		}

		if (!stripe || !elements) {
			setMessage('Payment system not initialized. Please try again.');
			return;
		}

		// Validate all required fields
		if (!email || !address?.phone || !selectedRate) {
			setMessage('Please fill in all required fields');
			return;
		}

		submitAttempted.current = true;
		setIsLoading(true);
		setMessage(null);

		try {
			console.log('Starting payment submission process');

			// Validate fields with Stripe Elements
			console.log('Validating Stripe Elements');
			const { error: validationError } = await elements.submit();
			if (validationError) {
				console.error('Stripe Elements validation error:', validationError);
				throw validationError;
			}

			// Final update to payment intent with current details
			console.log('Updating payment intent with final details');
			const finalPaymentIntent = await updatePaymentIntent(cart, selectedRate, paymentIntentId);

			console.log('Payment intent update response:', finalPaymentIntent);

			if (!finalPaymentIntent) {
				console.error('No response from payment intent update');
				throw new Error('Failed to prepare payment. Please try again.');
			}

			if (!finalPaymentIntent.clientSecret) {
				console.error('No client secret in payment intent response');
				throw new Error('Failed to prepare payment. Please try again.');
			}

			console.log('Confirming payment with Stripe');
			const { error: confirmError } = await stripe.confirmPayment({
				elements,
				clientSecret: finalPaymentIntent.clientSecret,
				confirmParams: {
					return_url: `${window.location.origin}/checkout/success`,
					payment_method_data: {
						billing_details: {
							name: address.name,
							email: email,
							phone: address.phone,
						},
					},
				},
			});

			if (confirmError) {
				console.error('Payment confirmation error:', confirmError);
				throw confirmError;
			}

		} catch (error) {
			console.error('Payment error:', error);
			setMessage(error instanceof Error ? error.message : 'An error occurred with the payment');
			submitAttempted.current = false;
		} finally {
			setIsLoading(false);
		}
	};

	const subtotal = getTotalPrice();
	const shippingCost = selectedRate?.rate || 0;
	const total = (Number(subtotal) + Number(shippingCost)).toFixed(2);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div className="flex items-center mb-8">
				<Link href="/cart" className="flex items-center text-sm text-neutral-600 hover:text-neutral-900">
					<ArrowLeft className="w-4 h-4 mr-2" />
					Return to cart
				</Link>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
				{/* Left Column - Order Summary */}
				<div className="order-2 lg:order-1">
					<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
						<h2 className="text-xl font-semibold mb-4">Order Summary</h2>
						<div className="space-y-4 mb-6">
							{cart.map(item => (
								<div key={item.id} className="flex gap-4 py-4 border-b">
									<div className="relative w-20 h-20">
										<Image
											src={item.image}
											alt={item.name}
											fill
											className="object-cover rounded-md"
										/>
										<div className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-900 rounded-full flex items-center justify-center text-white text-xs">
											{item.quantity}
										</div>
									</div>
									<div className="flex-1">
										<h3 className="font-medium">{item.name}</h3>
										<p className="text-sm text-neutral-600">
											€{(item.price * item.quantity).toFixed(2)}
										</p>
									</div>
								</div>
							))}
						</div>

						<div className="space-y-2 text-sm">
							<div className="flex justify-between py-2">
								<span className="text-neutral-600">Subtotal</span>
								<span>€{subtotal}</span>
							</div>
							{selectedRate && (
								<div className="flex justify-between py-2">
									<span className="text-neutral-600">
										Shipping ({selectedRate.name})
									</span>
									<span>€{shippingCost}</span>
								</div>
							)}
							<div className="flex justify-between py-4 border-t border-neutral-200 text-lg font-semibold">
								<span>Total</span>
								<span>€{total}</span>
							</div>
						</div>
					</div>

					<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
						<div className="flex items-center gap-2 text-sm text-neutral-600">
							<Shield className="w-4 h-4" />
							<span>Secure checkout powered by Stripe</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-neutral-600">
							<Truck className="w-4 h-4" />
							<span>Free shipping on orders over €100</span>
						</div>
					</div>
				</div>

				{/* Right Column - Checkout Form */}
				<div className="order-1 lg:order-2">
					<form onSubmit={handleSubmit} className="space-y-8">
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h3 className="text-lg font-semibold mb-4">Contact Information</h3>
							<LinkAuthenticationElement
								options={{
									defaultValues: { email },
								}}
								onChange={(e) => setEmail(e.value.email)}
							/>
						</div>

						<div className="bg-white rounded-lg shadow-sm p-6">
							<h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
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
								}}
								onChange={handleAddressChange}
							/>
						</div>

						{isCalculatingShipping ? (
							<div className="bg-white rounded-lg shadow-sm p-6">
								<div className="flex items-center justify-center py-4">
									<Loader2 className="w-6 h-6 animate-spin text-primary" />
									<span className="ml-2">Calculating shipping rates...</span>
								</div>
							</div>
						) : shippingRates.length > 0 && (
							<div className="bg-white rounded-lg shadow-sm p-6">
								<h3 className="text-lg font-semibold mb-4">Shipping Method</h3>
								<div className="space-y-3">
									{shippingRates.map((rate) => (
										<label
											key={rate.id}
											className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors
                        ${selectedRate?.id === rate.id ? 'border-primary bg-primary/5' : 'hover:bg-neutral-50'}`}
										>
											<input
												type="radio"
												name="shipping_rate"
												checked={selectedRate?.id === rate.id}
												onChange={() => handleShippingRateChange(rate)}
												className="radio radio-primary"
											/>
											<div className="flex-1">
												<div className="font-medium">{rate.name}</div>
												<div className="text-sm text-neutral-600">
													{rate.min_delivery_days}-{rate.max_delivery_days} business days
												</div>
											</div>
											<div className="font-semibold">
												€{rate.rate}
											</div>
										</label>
									))}
								</div>
							</div>
						)}

						<div className="bg-white rounded-lg shadow-sm p-6">
							<h3 className="text-lg font-semibold mb-4">Payment Method</h3>
							<PaymentElement />
						</div>

						{message && (
							<div className="flex items-center gap-2 p-4 bg-error/10 text-error rounded-lg">
								<AlertCircle className="w-5 h-5" />
								{message}
							</div>
						)}

						<button
							type="submit"
							disabled={!stripe || isLoading || !selectedRate || !address?.phone || !email}
							className="w-full btn btn-primary btn-lg gap-2"
						>
							{isLoading ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									Processing...
								</>
							) : (
								<>
									<Lock className="w-5 h-5" />
									Pay €{total}
								</>
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default CheckoutForm;