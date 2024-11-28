// app/checkout/success/page.tsx
'use client';

import { useCartStore } from '@/store/cartStore';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function CheckoutSuccessContent() {
	const clearCart = useCartStore((state) => state.clearCart);
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [attempts, setAttempts] = useState(0);
	const maxAttempts = 10; // Maximum number of attempts to check order status

	useEffect(() => {
		clearCart();
		const sessionId = searchParams.get('session_id');

		if (!sessionId) {
			setError('No session ID found');
			setIsLoading(false);
			return;
		}

		const checkOrderStatus = async () => {
			try {
				const response = await fetch(`/api/stripe/get-order?session_id=${sessionId}`);
				const data = await response.json();

				if (response.status === 202) {
					// Order is still processing
					if (attempts < maxAttempts) {
						// Wait 2 seconds before trying again
						setTimeout(() => {
							setAttempts(prev => prev + 1);
						}, 2000);
					} else {
						throw new Error('Order processing timeout. Please check your email for confirmation.');
					}
					return;
				}

				if (!response.ok) {
					throw new Error(data.error || 'Failed to process order');
				}

				if (data.orderId) {
					router.push(`/orders/${data.orderId}`);
				} else {
					throw new Error('No order ID returned');
				}
			} catch (error) {
				setError(error instanceof Error ? error.message : 'An error occurred');
				setIsLoading(false);
			}
		};

		checkOrderStatus();
	}, [clearCart, searchParams, router, attempts]);

	if (error) {
		return (
			<div className="min-h-screen bg-base-100">
				<div className="container mx-auto px-4 py-24">
					<div className="max-w-2xl mx-auto text-center space-y-8">
						<div className="flex items-center justify-center mb-6">
							<div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center">
								<AlertCircle className="w-10 h-10 text-error" />
							</div>
						</div>
						<div className="bg-error/10 rounded-lg p-8">
							<h2 className="text-xl font-serif text-error mb-4">{error}</h2>
							<p className="text-neutral/70 mb-6">
								Your payment has been processed, but there was an issue creating your order.
								Please check your email for confirmation or contact our support team.
							</p>
							<Link href="/contact" className="btn btn-error">
								Contact Support
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-base-100">
			<div className="container mx-auto px-4 py-24">
				<div className="max-w-2xl mx-auto text-center space-y-8">
					{isLoading ? (
						<div className="space-y-4">
							<Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
							<p className="text-lg text-neutral">
								Processing your order... {attempts > 0 && `(Attempt ${attempts}/${maxAttempts})`}
							</p>
						</div>
					) : (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="space-y-4"
						>
							<Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
							<p className="text-lg text-neutral">Redirecting to your order...</p>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function CheckoutSuccess() {
	return <CheckoutSuccessContent />;
}