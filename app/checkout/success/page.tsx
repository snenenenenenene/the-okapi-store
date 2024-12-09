'use client';

import { useCartStore } from '@/store/cartStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function CheckoutSuccessContent() {
	const clearCart = useCartStore((state) => state.clearCart);
	const searchParams = useSearchParams();
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchOrderId = async () => {
			const paymentIntentId = searchParams.get('payment_intent');
			

			if (!paymentIntentId) {
				setError('No payment intent ID found');
				return;
			}

			try {
				clearCart();
				

				const response = await fetch(`/api/orders/lookup`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						orderId: paymentIntentId,
					}),
				});

				
				const data = await response.json();
				

				if (data.order?.id) {
					
					router.replace(`/orders/${data.order.id}`);
				} else {
					setError('Order not found in response');
				}
			} catch (error) {
				console.error('Error fetching order:', error);
				setError('Error fetching order');
			}
		};

		fetchOrderId();
	}, [clearCart, searchParams, router]);

	if (error) {
		return (
			<div className="min-h-screen bg-base-100 flex items-center justify-center">
				<div className="text-center">
					<p className="text-lg text-red-500">{error}</p>
					<p className="mt-4">This has been logged for debugging.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-base-100 flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
				<p className="mt-4">Processing your order...</p>
			</div>
		</div>
	);
}

export default function CheckoutSuccess() {
	return <CheckoutSuccessContent />;
}