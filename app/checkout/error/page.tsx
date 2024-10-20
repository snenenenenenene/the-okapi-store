'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'

export default function CheckoutError() {
	const toggleCart = useCartStore((state) => state.toggleCart)
	const searchParams = useSearchParams()
	const [errorMessage, setErrorMessage] = useState('')
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [errorDetails, setErrorDetails] = useState<any>(null)

	useEffect(() => {
		const error = searchParams.get('error')
		const details = searchParams.get('details')

		switch (error) {
			case 'no_session':
				setErrorMessage('No checkout session found. Please try again.')
				break
			case 'no_shipping':
				setErrorMessage('Shipping information is missing. Please ensure you provide a valid shipping address.')
				break
			case 'no_valid_items':
				setErrorMessage('There was an issue with the items in your order. Some products may be misconfigured.')
				if (details) {
					try {
						setErrorDetails(JSON.parse(decodeURIComponent(details)))
					} catch (e) {
						console.error('Error parsing error details:', e)
					}
				}
				break
			case 'printful_order':
				setErrorMessage('There was an issue creating your order with our fulfillment partner. Our team has been notified and will resolve this as soon as possible.')
				if (details) {
					try {
						setErrorDetails(JSON.parse(decodeURIComponent(details)))
					} catch (e) {
						console.error('Error parsing error details:', e)
					}
				}
				break
			default:
				setErrorMessage('An unknown error occurred. Please try again or contact support if the issue persists.')
		}
	}, [searchParams])

	return (
		<div className="container mx-auto px-4 py-8 text-center">
			<h1 className="text-3xl font-bold mb-4 text-error">Checkout Error</h1>
			<p className="text-lg mb-4">{errorMessage}</p>
			{errorDetails && (
				<div className="mb-4 text-left">
					<h2 className="text-xl font-semibold mb-2">Error Details:</h2>
					<pre className="bg-base-200 p-4 rounded overflow-x-auto">
						{JSON.stringify(errorDetails, null, 2)}
					</pre>
				</div>
			)}
			<p className="text-lg mb-8">
				We apologize for the inconvenience. Please try again or contact our support team if the problem persists.
			</p>
			<div className="flex justify-center space-x-4">
				<button
					onClick={toggleCart}
					className="btn btn-primary"
				>
					Return to Cart
				</button>
				<Link href="/contact" className="btn btn-outline">
					Contact Support
				</Link>
			</div>
		</div>
	)
}