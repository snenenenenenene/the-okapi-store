/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, AlertCircle, Clock, Calendar } from 'lucide-react'
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
  createdAt: string
  status: string
  total: number
  orderItems: OrderItem[]
  trackingNumber?: string
  trackingUrl?: string
}

const statusColors = {
  pending: 'bg-warning/10 text-warning',
  processing: 'bg-info/10 text-info',
  shipped: 'bg-success/10 text-success',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-error/10 text-error',
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-5 h-5" />
    case 'processing':
      return <Package className="w-5 h-5" />
    case 'shipped':
      return <Truck className="w-5 h-5" />
    case 'delivered':
      return <CheckCircle className="w-5 h-5" />
    case 'cancelled':
      return <AlertCircle className="w-5 h-5" />
    default:
      return <Clock className="w-5 h-5" />
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        const data = await response.json()
        console.log('Fetched orders:', data)
        setOrders(data)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchOrders()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-neutral">
        <h1 className="text-2xl font-serif mb-4">Please sign in to view your orders</h1>
        <button
          onClick={() => signIn('google')}
          className="btn btn-primary"
        >
          Sign In
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-neutral">
        <h1 className="text-2xl font-serif mb-4">Error loading orders</h1>
        <p className="text-error mb-4">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-6 py-24">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-serif mb-12 text-neutral"
        >
          Your Orders
        </motion.h1>

        {(!orders || orders.length === 0) ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-serif text-neutral mb-4">No orders yet</h2>
            <Link href="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-base-100 border border-base-200 rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between mb-6">
                    <div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm text-neutral/70 mb-1 hover:text-primary"
                      >
                        Order #{order.id}
                      </Link>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral/70" />
                        <p className="text-sm text-neutral/70">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${statusColors[order.status as keyof typeof statusColors]}`}>
                        <StatusIcon status={order.status} />
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-neutral">{item.product.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-neutral">x{item.quantity}</p>
                          <p className="text-sm text-neutral/70">
                            €{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-base-200">
                    <div className="flex justify-between items-center">
                      <p className="font-serif text-neutral">Total</p>
                      <p className="font-serif text-lg text-neutral">
                        €{order.total.toFixed(2)}
                      </p>
                    </div>

                    {order.trackingNumber && (
                      <div className="mt-4">
                        <p className="text-sm text-neutral/70 mb-2">
                          Tracking Number: {order.trackingNumber}
                        </p>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 text-sm"
                          >
                            Track Package →
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}