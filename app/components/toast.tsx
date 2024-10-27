// components/Toast.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
	message: string
	type?: 'success' | 'error' | 'info'
	duration?: number
	onClose: () => void
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
	const [isVisible, setIsVisible] = useState(true)

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(false)
			onClose()
		}, duration)

		return () => clearTimeout(timer)
	}, [duration, onClose])

	const getToastColor = () => {
		switch (type) {
			case 'success':
				return 'bg-success text-white'
			case 'error':
				return 'bg-error text-white'
			default:
				return 'bg-info text-white'
		}
	}

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 50 }}
					className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${getToastColor()}`}
					role="alert"
				>
					<p>{message}</p>
				</motion.div>
			)}
		</AnimatePresence>
	)
}