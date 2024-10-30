/* eslint-disable @typescript-eslint/no-explicit-any */
// Components/Cart.tsx
import { formatEuroPrice } from '@/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function Cart() {
	const {
		cart,
		removeFromCart,
		updateCartItemQuantity,
		clearCart,
		toggleCart,
		getTotalPrice,
		checkout
	} = useCartStore();
	const [isLoading, setIsLoading] = useState(false);
	const cartRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
				toggleCart();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [toggleCart]);

	const handleCheckout = async () => {
		setIsLoading(true);
		try {
			const sessionId: any = await checkout();
			const stripe = await stripePromise;
			if (stripe) {
				const { error } = await stripe.redirectToCheckout({ sessionId });
				if (error) {
					console.error('Stripe checkout error:', error);
				}
			}
		} catch (error) {
			console.error('Checkout error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
			>
				<motion.div
					ref={cartRef}
					initial={{ x: '100%' }}
					animate={{ x: 0 }}
					exit={{ x: '100%' }}
					transition={{ type: 'tween' }}
					className="bg-base-100 w-full max-w-md p-6 overflow-y-auto"
				>
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-2xl font-bold text-neutral">Your Cart</h2>
						<button onClick={toggleCart} className="btn btn-ghost btn-circle">
							<X size={24} />
						</button>
					</div>

					{cart.length === 0 ? (
						<p className="text-neutral">Your cart is empty.</p>
					) : (
						<>
							{cart.map((item) => (
								<motion.div
									key={item.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									className="flex items-center justify-between mb-4 pb-4 border-b border-base-300"
								>
									<div className="flex items-center">
										<Image
											src={item.image}
											alt={item.name}
											width={50}
											height={50}
											className="rounded"
										/>
										<div className="ml-4">
											<h3 className="font-semibold text-neutral">{item.name}</h3>
											<p className="text-primary">{formatEuroPrice(item.price)}</p>
										</div>
									</div>
									<div className="flex items-center">
										<input
											type="number"
											min="1"
											value={item.quantity}
											onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value))}
											className="input input-bordered w-16 max-w-xs"
										/>
										<button
											onClick={() => removeFromCart(item.id)}
											className="btn btn-ghost btn-sm ml-2"
										>
											Remove
										</button>
									</div>
								</motion.div>
							))}
							<div className="mt-4">
								<p className="text-xl font-semibold text-neutral">
									Total: {formatEuroPrice(getTotalPrice())}
								</p>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="btn btn-primary btn-block mt-4"
									onClick={handleCheckout}
									disabled={isLoading}
								>
									{isLoading ? 'Processing...' : 'Proceed to Checkout'}
								</motion.button>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={clearCart}
									className="btn btn-outline btn-block mt-2"
								>
									Clear Cart
								</motion.button>
							</div>
						</>
					)}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}