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

  const StatusIcon = statusMap[order.status as keyof typeof statusMap]?.icon || Clock

  return (
    <div className="min-h-screen bg-base-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-base-100 rounded-lg overflow-hidden"
        >
          <div className="bg-warning/10 p-4 text-warning text-sm">
            Note: This order link can be shared, but please be cautious about sharing order details.
          </div>

          <div className="p-6 border-b border-base-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-serif text-neutral mb-2">Order #{order.id}</h1>
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
                >
                  <Share2 className="h-5 w-5" />
                  {shareClicked && <span className="ml-2">Copied!</span>}
                </button>
              </div>
            </div>
          </div>

          {order.printfulDetails && (
            <div className="bg-primary/5 p-6 m-6 rounded-lg">
              <h3 className="font-serif text-lg mb-4">Shipping Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span>{order.printfulDetails.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Method:</span>
                  <span>{order.printfulDetails.shipping_service}</span>
                </div>
                {order.printfulDetails.estimated_delivery && (
                  <div className="flex justify-between">
                    <span>Estimated Delivery:</span>
                    <span>{new Date(order.printfulDetails.estimated_delivery).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {order.printfulDetails.shipments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-base-200">
                  <h4 className="font-medium mb-3">Tracking Information</h4>
                  {order.printfulDetails.shipments.map((shipment, index) => (
                    <div key={index} className="bg-base-100 p-4 rounded-lg mb-2">
                      <div className="flex justify-between mb-2">
                        <span>{shipment.carrier} - {shipment.service}</span>
                        <span className="badge badge-primary">{shipment.status}</span>
                      </div>
                      {shipment.tracking_number && (
                        <div className="text-sm">
                          <p className="mb-2">Tracking Number: {shipment.tracking_number}</p>
                          {shipment.tracking_url && (
                            <Link
                              href={shipment.tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline"
                            >
                              Track Package
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b border-base-200 pb-4 mb-4">
                <div className="relative h-20 w-20">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-neutral/70">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">
                  €{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4">
              <span className="font-serif text-lg">Total</span>
              <span className="font-serif text-lg">€{order.total.toFixed(2)}</span>
            </div>

            {order.printfulDetails?.recipient && (
              <div className="bg-primary/5 rounded-lg p-4 mt-6">
                <h3 className="font-serif mb-2">Shipping Address</h3>
                <p className="text-neutral/70">
                  {order.printfulDetails.recipient.name}<br />
                  {order.printfulDetails.recipient.address1}<br />
                  {order.printfulDetails.recipient.address2 && (
                    <>{order.printfulDetails.recipient.address2}<br /></>
                  )}
                  {order.printfulDetails.recipient.city}, {order.printfulDetails.recipient.state} {order.printfulDetails.recipient.zip}<br />
                  {order.printfulDetails.recipient.country}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div >
    </div >
  )
}