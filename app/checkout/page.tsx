/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Checkout() {
	const { cart, getTotalPrice, checkout } = useCartStore()
	const [recipientData, setRecipientData] = useState({
		name: '',
		address1: '',
		city: '',
		state_code: '',
		country_code: '',
		zip: '',
	})
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setRecipientData(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError('')

		try {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			const sessionId: any = await checkout(recipientData)
			const stripe = await stripePromise
			const { error } = await stripe!.redirectToCheckout({ sessionId })

			if (error) {
				throw new Error(error.message)
			}
		} catch (error) {
			setError('Checkout failed. Please try again.')
			console.error('Checkout error:', error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-4">Checkout</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div>
					<h2 className="text-2xl font-semibold mb-4">Your Order</h2>
					{cart.map(item => (
						<div key={item.id} className="flex justify-between mb-2">
							<span>{item.name} x {item.quantity}</span>
							<span>${item.price * (item.quantity || 0)}</span>
						</div>
					))}
					<div className="text-xl font-bold mt-4">
						Total: ${getTotalPrice()}
					</div>
				</div>
				<div>
					<h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
					<form onSubmit={handleSubmit} className="space-y-4">
						<input
							type="text"
							name="name"
							value={recipientData.name}
							onChange={handleInputChange}
							placeholder="Full Name"
							className="input input-bordered w-full"
							required
						/>
						<input
							type="text"
							name="address1"
							value={recipientData.address1}
							onChange={handleInputChange}
							placeholder="Address"
							className="input input-bordered w-full"
							required
						/>
						<input
							type="text"
							name="city"
							value={recipientData.city}
							onChange={handleInputChange}
							placeholder="City"
							className="input input-bordered w-full"
							required
						/>
						<input
							type="text"
							name="state_code"
							value={recipientData.state_code}
							onChange={handleInputChange}
							placeholder="State"
							className="input input-bordered w-full"
							required
						/>
						<input
							type="text"
							name="country_code"
							value={recipientData.country_code}
							onChange={handleInputChange}
							placeholder="Country Code (e.g., US, CA, GB)"
							className="input input-bordered w-full"
							required
						/>
						<input
							type="text"
							name="zip"
							value={recipientData.zip}
							onChange={handleInputChange}
							placeholder="ZIP Code"
							className="input input-bordered w-full"
							required
						/>
						{error && <p className="text-red-500">{error}</p>}
						<button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
							{isLoading ? 'Processing...' : 'Proceed to Payment'}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}