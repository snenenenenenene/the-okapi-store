'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, Clock, CheckCircle, Share2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  trackingNumber: string | null
  trackingUrl: string | null
  printfulStatus: string | null
  orderItems: OrderItem[]
}

const statusMap = {
  pending: { icon: Clock, label: 'Pending', color: 'text-warning' },
  processing: { icon: Package, label: 'Processing', color: 'text-info' },
  shipped: { icon: Truck, label: 'Shipped', color: 'text-primary' },
  delivered: { icon: CheckCircle, label: 'Delivered', color: 'text-success' }
}

export default function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareClicked, setShareClicked] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        if (!response.ok) {
          throw new Error('Order not found')
        }
        const data = await response.json()
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

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
      // Fallback to copying to clipboard
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-error mb-4">{error}</h1>
        <Link href="/" className="btn btn-primary">
          Return Home
        </Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-neutral mb-4">Order not found</h1>
        <Link href="/" className="btn btn-primary">
          Return Home
        </Link>
      </div>
    )
  }

  const StatusIcon = statusMap[order.status as keyof typeof statusMap]?.icon || Clock

  return (
    <div className="min-h-screen bg-base-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-base-100 rounded-lg overflow-hidden"
        >
          {/* Share Warning */}
          <div className="bg-warning/10 p-4 text-warning text-sm">
            Note: This order link can be shared, but please be cautious about sharing order details as they may contain personal information.
          </div>

          {/* Order Header */}
          <div className="p-6 border-b border-base-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-serif text-neutral mb-2">
                  Order #{order.id}
                </h1>
                <p className="text-neutral/70">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${statusMap[order.status as keyof typeof statusMap]?.color || 'text-neutral'}`}>
                  <StatusIcon className="h-5 w-5" />
                  <span className="font-medium">
                    {statusMap[order.status as keyof typeof statusMap]?.label || order.status}
                  </span>
                </div>
                <button
                  onClick={handleShare}
                  className="btn btn-ghost btn-sm"
                  title="Share order"
                >
                  <Share2 className="h-5 w-5" />
                  {shareClicked && <span className="ml-2">Copied!</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b border-base-200 pb-4">
                  <div className="relative h-20 w-20 bg-base-200 rounded-lg overflow-hidden">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral">{item.product.name}</h3>
                    <p className="text-neutral/70">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-base-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-serif text-neutral">Total</span>
                <span className="font-serif text-lg text-neutral">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Tracking Information */}
            {(order.trackingNumber || order.trackingUrl) && (
              <div className="bg-primary/5 rounded-lg p-4 mt-6">
                <h3 className="font-serif text-neutral mb-2">Tracking Information</h3>
                <p className="text-neutral/70 mb-2">
                  Tracking Number: {order.trackingNumber}
                </p>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                  >
                    Track Package
                  </a>
                )}
              </div>
            )}

            {/* Printful Status */}
            {order.printfulStatus && (
              <div className="text-neutral/70 text-sm mt-4">
                Fulfillment Status: {order.printfulStatus}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}