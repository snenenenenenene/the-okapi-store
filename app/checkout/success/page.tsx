'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutSuccess() {
	const clearCart = useCartStore((state) => state.clearCart)
	const searchParams = useSearchParams()
	const router = useRouter()
	const [isRedirecting, setIsRedirecting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		clearCart()
		const sessionId = searchParams.get('session_id')

		if (sessionId) {
			const fetchOrderId = async () => {
				try {
					setIsRedirecting(true)
					const response = await fetch(`/api/stripe/get-order?session_id=${sessionId}`)
					const data = await response.json()

					if (data.orderId) {
						router.push(`/orders/${data.orderId}`)
					} else {
						setError('Could not find your order. Please contact support.')
						setIsRedirecting(false)
					}
				} catch (error) {
					console.error('Error fetching order:', error)
					setError('An error occurred while retrieving your order.')
					setIsRedirecting(false)
				}
			}

			fetchOrderId()
		}
	}, [clearCart, searchParams, router])

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
								Don&apos;t worry, your order has been received. Please check your email for confirmation
								or contact our support team.
							</p>
							<Link href="/contact" className="btn btn-primary">
								Contact Support
							</Link>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-base-100">
			<div className="container mx-auto px-4 py-24">
				<div className="max-w-2xl mx-auto text-center space-y-8">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto"
					>
						<Check className="w-10 h-10 text-success" />
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<h1 className="text-4xl md:text-5xl font-serif text-neutral">
							Thank You for Your Order!
						</h1>

						<p className="text-xl text-neutral/70">
							Your payment has been successfully processed and your order is being prepared.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-primary/5 rounded-lg p-8 space-y-4"
					>
						<div className="flex items-center justify-center gap-3 text-primary">
							<Mail className="w-6 h-6" />
							<p className="font-medium">Check Your Inbox</p>
						</div>
						<p className="text-neutral/70">
							We&apos;ve sent a confirmation email with your order details.
							If you don&apos;t see it, please check your spam folder.
						</p>
					</motion.div>

					{isRedirecting && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex items-center justify-center gap-2 text-neutral/70"
						>
							<p>Redirecting to your order details</p>
							<ArrowRight className="w-4 h-4 animate-pulse" />
						</motion.div>
					)}
				</div>
			</div>
		</div>
	)
}