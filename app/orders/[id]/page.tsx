'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Clock, Package, Share2, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
  }
}

interface PrintfulShipment {
  carrier: string
  service: string
  tracking_number: string
  tracking_url: string
  ship_date: string
  shipped_at: string | null
  estimated_delivery: string
  status: string
}

interface PrintfulDetails {
  status: string
  created: string
  updated: string
  shipping_service: string
  estimated_delivery: string
  recipient: {
    name: string
    address1: string
    address2?: string
    city: string
    state: string
    country: string
    zip: string
  }
  items: Array<{
    name: string
    quantity: number
    status: string
    retail_price: string
  }>
  retail_costs: {
    currency: string
    subtotal: string
    discount: string
    shipping: string
    tax: string
    vat: string | null
    total: string
  }
  costs: {
    subtotal: string
    shipping: string
    tax: string
    total: string
  }
  shipments: PrintfulShipment[]
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  trackingNumber: string | null
  trackingUrl: string | null
  printfulStatus: string | null
  stripePaymentId: string | null
  printfulId: string | null
  orderItems: OrderItem[]
  printfulDetails?: PrintfulDetails
  subtotal: number
  shippingCost: number
  vatAmount: number
  shippingName?: string
}

const statusMap = {
  pending: { icon: Clock, label: 'Pending', color: 'text-warning' },
  processing: { icon: Package, label: 'Processing', color: 'text-info' },
  shipped: { icon: Truck, label: 'Shipped', color: 'text-primary' },
  delivered: { icon: CheckCircle, label: 'Delivered', color: 'text-success' }
}

export default async function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareClicked, setShareClicked] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await fetch(`/api/orders/${params.id}`)
      if (!response.ok) {
        throw new Error('Order not found')
      }
      const data = await response.json()
      console.log('Fetched order data:', data)
      setOrder(data)
    }
    setLoading(false)
    if (params.id) {
      fetchOrder()
    }
  }, [params.id])

  const handleShare = async () => {
    const orderUrl = `${window.location.origin}/orders/${params.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order #${params.id}`,
          text: 'Check out my order from The Okapi Store',
          url: orderUrl
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(orderUrl)
        setShareClicked(true)
        setTimeout(() => setShareClicked(false), 2000)
      } catch (err) {
        console.error('Error copying to clipboard:', err)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-error mb-4">{error}</h1>
        <Link href="/" className="btn btn-primary">Return Home</Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-neutral mb-4">Order not found</h1>
        <Link href="/" className="btn btn-primary">Return Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 dark:bg-neutral-900">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        {/* Back Link */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            href="/" 
            className="group inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <svg 
              className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shop
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-medium">Your Order Confirmed!</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            Hello! Your order has been confirmed and will be shipping within the next few days.
          </p>
        </motion.div>

        {/* Order Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y border-neutral-200 dark:border-neutral-800"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="space-y-1"
          >
            <div className="font-medium text-neutral-500 dark:text-neutral-400">Order Date</div>
            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="space-y-1"
          >
            <div className="font-medium text-neutral-500 dark:text-neutral-400">Order No</div>
            <div className="font-mono">{order.id}</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="space-y-1"
          >
            <div className="font-medium text-neutral-500 dark:text-neutral-400">Payment</div>
            <div>•••• {order.stripePaymentId?.slice(-4)}</div>
          </motion.div>
          {order.printfulDetails?.recipient && (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="space-y-1"
            >
              <div className="font-medium text-neutral-500 dark:text-neutral-400">Ships To</div>
              <div>{order.printfulDetails.recipient.city}</div>
            </motion.div>
          )}
        </motion.div>

        {/* Order Items */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-medium">Order Items</h2>
          <div className="space-y-4">
            {order.orderItems.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-6 p-4 rounded-lg bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md transition-all"
              >
                <Link href={`/product/${item.product.id}`} className="relative h-24 w-24 bg-neutral-50 dark:bg-neutral-700 rounded-lg overflow-hidden">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/product/${item.product.id}`}
                    className="font-medium hover:text-primary dark:hover:text-neutral-100 transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Quantity: {item.quantity}</p>
                </div>
                <div className="font-medium whitespace-nowrap">
                  €{(item.price * item.quantity).toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 max-w-sm ml-auto"
        >
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Subtotal (excl. VAT)</span>
            <motion.span whileHover={{ scale: 1.05 }}>
              €{order.subtotal.toFixed(2)}
            </motion.span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping{order.shippingName ? ` (${order.shippingName})` : ''}</span>
            <motion.span whileHover={{ scale: 1.05 }}>
              €{order.shippingCost.toFixed(2)}
            </motion.span>
          </div>
          <div className="flex justify-between text-sm">
            <span>VAT (23%)</span>
            <motion.span whileHover={{ scale: 1.05 }}>
              €{order.vatAmount.toFixed(2)}
            </motion.span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total (incl. VAT)</span>
            <motion.span whileHover={{ scale: 1.05 }}>
              €{order.total.toFixed(2)}
            </motion.span>
          </div>
        </motion.div>

        {/* Shipping Status */}
        {order.printfulDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-medium">Shipping Information</h2>
            <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
              {order.printfulDetails.status && (() => {
                const StatusIcon = statusMap[order.printfulDetails.status.toLowerCase()]?.icon;
                return StatusIcon ? <StatusIcon className="h-5 w-5" /> : null;
              })()}
              <span>
                {order.printfulDetails.status} - Estimated delivery: {' '}
                {order.printfulDetails.estimated_delivery 
                  ? new Date(order.printfulDetails.estimated_delivery).toLocaleDateString()
                  : 'To be determined'}
              </span>
            </div>
            {order.printfulDetails.shipments.map((shipment, index) => (
              shipment.tracking_url && (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.01 }}
                >
                  <Link
                    href={shipment.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary dark:text-neutral-100 hover:text-primary-focus dark:hover:text-neutral-200 transition-colors"
                  >
                    Track Package
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              )
            ))}
          </motion.div>
        )}

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-4 pt-8 border-t border-neutral-200 dark:border-neutral-800"
        >
          <p className="text-neutral-600 dark:text-neutral-400">
            Need help? {' '}
            <Link href="/help" className="text-primary dark:text-neutral-100 hover:text-primary-focus dark:hover:text-neutral-200 transition-colors">
              Visit our Help Center
            </Link>
            {' '} or {' '}
            <Link href="/contact" className="text-primary dark:text-neutral-100 hover:text-primary-focus dark:hover:text-neutral-200 transition-colors">
              contact us
            </Link>.
          </p>
          <p className="text-neutral-500 dark:text-neutral-600">Thank you for shopping with us!</p>
        </motion.div>
      </div>
    </div>
  )
}