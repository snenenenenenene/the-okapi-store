'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'

export default function CheckoutSuccess() {
	const clearCart = useCartStore((state) => state.clearCart)

	useEffect(() => {
		clearCart()
	}, [clearCart])

	return (
		<div className="container mx-auto px-4 py-8 text-center">
			<h1 className="text-3xl font-bold mb-4">Checkout Successful</h1>
			<p className="text-lg mb-4">Thank you for your order! We've received your payment and are processing your order.</p>
			<p className="text-lg mb-4">You will receive an email confirmation shortly.</p>
		</div>
	)
}