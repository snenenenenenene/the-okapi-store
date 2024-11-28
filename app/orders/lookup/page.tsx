// app/orders/lookup/page.tsx
'use client';

import { Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OrderLookupPage() {
	const [email, setEmail] = useState('');
	const [orderId, setOrderId] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/orders/lookup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, orderId })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to find order');
			}

			// Redirect to order page with secure token
			router.push(`/orders/${orderId}?token=${data.token}&email=${encodeURIComponent(email)}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to lookup order');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-base-100 py-12">
			<div className="container mx-auto px-4 max-w-md">
				<h1 className="text-2xl md:text-3xl font-serif text-neutral mb-8">
					Track Your Order
				</h1>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-neutral mb-2">
							Order Email
						</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="input input-bordered w-full"
							placeholder="Enter your email address"
							required
						/>
					</div>

					<div>
						<label htmlFor="orderId" className="block text-sm font-medium text-neutral mb-2">
							Order ID
						</label>
						<input
							type="text"
							id="orderId"
							value={orderId}
							onChange={(e) => setOrderId(e.target.value)}
							className="input input-bordered w-full"
							placeholder="Enter your order ID"
							required
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
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin mr-2" />
								Looking up order...
							</>
						) : (
							<>
								<Search className="w-4 h-4 mr-2" />
								Track Order
							</>
						)}
					</button>
				</form>

				<p className="mt-6 text-sm text-neutral/70 text-center">
					The order ID can be found in your order confirmation email.
				</p>
			</div>
		</div>
	);
}