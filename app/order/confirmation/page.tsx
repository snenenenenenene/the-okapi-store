'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, XCircle, Clock, PackageCheck, Truck, Share2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatEuroPrice } from '@/utils/formatters'
import { motion } from 'framer-motion'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const StatusIndicator = ({ status }: { status: string }) => {
  const getStatusInfo = () => {
    switch (status.toLowerCase()) {
      case 'draft':
        return { icon: Clock, label: 'Processing', color: 'text-warning bg-warning/10' }
      case 'pending':
        return { icon: PackageCheck, label: 'Pending', color: 'text-info bg-info/10' }
      case 'fulfilled':
        return { icon: Truck, label: 'Shipped', color: 'text-success bg-success/10' }
      default:
        return { icon: Clock, label: status, color: 'text-neutral bg-neutral/10' }
    }
  }

  const { icon: Icon, label, color } = getStatusInfo()
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${color}`}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium capitalize">{label}</span>
    </div>
  )
}

export default function OrderConfirmation() {
  const [status, setStatus] = useState<'success' | 'processing' | 'error'>('processing')
  const [message, setMessage] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const { clearCart } = useCartStore()

  useEffect(() => {
    const checkStatus = async () => {
      const stripe = await stripePromise
      if (!stripe) {
        setStatus('error')
        setMessage('Could not connect to payment provider.')
        return
      }

      const clientSecret = searchParams.get('payment_intent_client_secret')
      const paymentIntent = searchParams.get('payment_intent')

      if (!clientSecret || !paymentIntent) {
        setStatus('error')
        setMessage('No payment information found.')
        return
      }

      try {
        // Check payment status
        const { paymentIntent: intent } = await stripe.retrievePaymentIntent(clientSecret)
        
        switch (intent?.status) {
          case 'succeeded':
            setStatus('success')
            setMessage('Payment successful! Thank you for your order.')
            clearCart()
            
            // Fetch order details using the payment intent ID
            const response = await fetch(`/api/orders/payment/${intent.id}`)
            if (response.ok) {
              const orderData = await response.json()
              setOrder(orderData)
            } else {
              console.error('Failed to fetch order details')
            }
            break
          case 'processing':
            setStatus('processing')
            setMessage('Your payment is processing.')
            break
          case 'requires_payment_method':
            setStatus('error')
            setMessage('Your payment was not successful, please try again.')
            break
          default:
            setStatus('error')
            setMessage('Something went wrong.')
            break
        }
      } catch (err) {
        setStatus('error')
        setMessage('An error occurred while checking payment status.')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [searchParams, clearCart])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-vintage-black px-4">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-stone-400 border-t-stone-200" />
        <h1 className="mt-4 text-2xl font-semibold text-stone-200">Processing</h1>
        <p className="mt-2 text-stone-400">{message}</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-vintage-black px-4">
        <div className="w-full max-w-md space-y-8 rounded-lg p-8">
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-4 text-2xl font-semibold text-stone-200">Payment Failed</h1>
            <p className="mt-2 text-stone-400">{message}</p>
            <Link
              href="/checkout"
              className="mt-8 inline-block rounded-lg bg-stone-200 px-6 py-2 text-sm font-medium text-vintage-black transition-colors hover:bg-stone-300"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vintage-black px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-semibold text-stone-200">Order Confirmed!</h1>
          <p className="mt-2 text-stone-400">{message}</p>
        </div>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 rounded-lg border border-stone-800 bg-stone-900/50 p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-medium text-stone-200">Order #{order.id}</h2>
                <p className="text-sm text-stone-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusIndicator status={order.status} />
            </div>

            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border border-stone-800 bg-stone-900/50 p-4"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="font-medium text-stone-200">{item.product.name}</h3>
                    <p className="text-sm text-stone-400">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-right font-medium text-stone-200">
                    {formatEuroPrice(item.price)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-stone-800 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Subtotal</span>
                <span className="text-stone-200">{formatEuroPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Shipping</span>
                <span className="text-stone-200">{formatEuroPrice(order.shipping)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">Discount</span>
                  <span className="text-stone-200">-{formatEuroPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-stone-800 pt-2 text-lg font-medium">
                <span className="text-stone-200">Total</span>
                <span className="text-stone-200">{formatEuroPrice(order.total)}</span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Link
                href="/products"
                className="inline-block rounded-lg bg-stone-200 px-6 py-2 text-sm font-medium text-vintage-black transition-colors hover:bg-stone-300"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-stone-700 px-4 py-2 text-sm font-medium text-stone-400 transition-colors hover:border-stone-600 hover:text-stone-300"
              >
                <Share2 className="h-4 w-4" />
                Share Order
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
