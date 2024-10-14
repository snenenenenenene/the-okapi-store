'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'

export default function CheckoutCancel() {
	const toggleCart = useCartStore((state) => state.toggleCart)

	useEffect(() => {
		// You might want to log the cancellation or perform any cleanup here
	}, [])

	return (
		<div className="container mx-auto px-4 py-8 text-center">
			<h1 className="text-3xl font-bold mb-4 text-error">Checkout Cancelled</h1>
			<p className="text-lg mb-8">
				Your checkout process was cancelled or encountered an error.
				Don't worry, your cart items are still saved.
			</p>
			<div className="flex justify-center space-x-4">
				<button
					onClick={toggleCart}
					className="btn btn-primary"
				>
					Return to Cart
				</button>
				<Link href="/products" className="btn btn-outline">
					Continue Shopping
				</Link>
			</div>
		</div>
	)
}