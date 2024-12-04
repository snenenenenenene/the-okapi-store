'use client';

import { formatEuroPrice } from '@/utils/formatters';
import { motion } from 'framer-motion';
import { Clock, Loader2, PackageCheck, Share2, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const StatusIndicator = ({ status }: { status: string }) => {
  const getStatusInfo = () => {
    switch (status.toLowerCase()) {
      case 'draft':
        return { icon: Clock, label: 'Processing', color: 'text-warning bg-warning/10' };
      case 'pending':
        return { icon: PackageCheck, label: 'Pending', color: 'text-info bg-info/10' };
      case 'fulfilled':
        return { icon: Truck, label: 'Shipped', color: 'text-success bg-success/10' };
      default:
        return { icon: Clock, label: status, color: 'text-neutral bg-neutral/10' };
    }
  };

  const { icon: Icon, label, color } = getStatusInfo();
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${color}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium capitalize">{label}</span>
    </div>
  );
};

export default function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-error mb-4">{error || 'Order not found'}</h1>
          <Link href="/orders" className="btn btn-primary">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Order Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-serif mb-2">Order #{order.id}</h1>
              <p className="text-neutral/70">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <StatusIndicator status={order.printfulDetails?.status || order.status} />
              <button
                onClick={handleShare}
                className="btn btn-ghost btn-sm"
                aria-label="Share order"
              >
                <Share2 className="w-4 h-4" />
                {copied && <span className="ml-2">Copied!</span>}
              </button>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Items and Status */}
            <div className="space-y-6">
              <div className="bg-base-100 rounded-lg border border-base-200 overflow-hidden">
                <div className="p-6">
                  <h2 className="font-serif text-lg mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {order.orderItems.map((item: any) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-20 h-20">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-neutral/70">
                            Quantity: {item.quantity}
                          </p>
                          <p className="font-medium">
                            {formatEuroPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-base-200 p-6 bg-base-50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatEuroPrice(order.printfulDetails?.costs?.subtotal || order.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{formatEuroPrice(order.printfulDetails?.costs?.shipping || 0)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>{formatEuroPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Progress */}
              <div className="bg-primary/5 p-6 rounded-lg">
                <h2 className="font-serif text-lg mb-4">Order Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <PackageCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-neutral/70">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {order.printfulDetails?.status === 'draft' && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium">Processing Order</p>
                        <p className="text-sm text-neutral/70">
                          Your order is being prepared for production
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Customer and Shipping Info */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-base-100 rounded-lg border border-base-200 p-6">
                <h2 className="font-serif text-lg mb-4">Customer Information</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {order.user.name}</p>
                  <p><span className="font-medium">Email:</span> {order.user.email}</p>
                </div>
              </div>

              {/* Shipping Information */}
              {order.printfulDetails?.recipient && (
                <div className="bg-base-100 rounded-lg border border-base-200 p-6">
                  <h2 className="font-serif text-lg mb-4">Shipping Information</h2>
                  <div className="space-y-2">
                    <p>{order.printfulDetails.recipient.name}</p>
                    <p>{order.printfulDetails.recipient.address1}</p>
                    {order.printfulDetails.recipient.address2 && (
                      <p>{order.printfulDetails.recipient.address2}</p>
                    )}
                    <p>
                      {order.printfulDetails.recipient.city}, {order.printfulDetails.recipient.zip}
                    </p>
                    <p>{order.printfulDetails.recipient.country_name}</p>
                  </div>
                </div>
              )}

              {/* Shipping Method */}
              {order.printfulDetails?.shipping_service_name && (
                <div className="bg-base-100 rounded-lg border border-base-200 p-6">
                  <h2 className="font-serif text-lg mb-4">Shipping Method</h2>
                  <p>{order.printfulDetails.shipping_service_name}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}