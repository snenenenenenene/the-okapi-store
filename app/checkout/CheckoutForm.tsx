'use client';

import { useCartStore } from '@/store/cartStore';
import { useElements, useStripe } from '@stripe/react-stripe-js';
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
			// Validate that all cart items have variant_id
			if (cart.some(item => !item.variant_id)) {
				throw new Error('Some items in cart are missing variant_id');
			}

			const formattedItems = cart.map(item => ({
				variant_id: item.variant_id,
				quantity: item.quantity,
				price: item.price
			}));

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
					items: formattedItems
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to calculate shipping');
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
			console.error('Shipping calculation error:', error);
			setMessage(error instanceof Error ? error.message : 'Failed to calculate shipping rates');
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
		

		const result = await updatePaymentIntent(cart, rate, paymentIntentId);
		if (result?.paymentIntentId) {
			setPaymentIntentId(result.paymentIntentId);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (submitAttempted.current) {
			
			return;
		}

		if (!stripe || !elements) {
			setMessage('Payment system not initialized. Please try again.');
			return;
		}

		if (!email || !address?.phone || !selectedRate) {
			setMessage('Please fill in all required fields');
			return;
		}

		submitAttempted.current = true;
		setIsLoading(true);
		setMessage(null);

		try {
			// Validate cart items again before submission
			if (cart.some(item => !item.variant_id)) {
				throw new Error('Some items in cart are missing variant_id');
			}

			const { error: validationError } = await elements.submit();
			if (validationError) {
				throw validationError;
			}

			const finalPaymentIntent = await updatePaymentIntent(cart, selectedRate, paymentIntentId);
			if (!finalPaymentIntent || !finalPaymentIntent.clientSecret) {
				throw new Error('Failed to prepare payment. Please try again.');
			}

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

	// Return JSX (existing render code)
	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			{/* Existing JSX content */}
		</div>
	);
}

export default CheckoutForm;