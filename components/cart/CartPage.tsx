'use client';

import { useCartStore } from '@/store/cartStore';
import { formatEuroPrice } from '@/utils/formatters';
import { motion } from 'framer-motion';
import { ArrowRight, Gift, Loader2, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CartPage() {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getSubtotal,
    getShippingCost,
    getDiscount,
    getTotalPrice,
    applyCoupon,
    removeCoupon,
    appliedCouponCode,
  } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const router = useRouter();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateCartItemQuantity(itemId, newQuantity);
    }
  };

  const handleApplyCoupon = () => {
    if (applyCoupon(couponCode)) {
      setCouponError('');
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      router.push('/checkout');
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const discount = getDiscount();
  const total = getTotalPrice();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-medium">Your cart is empty</h1>
          <p className="text-neutral/70">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link href="/" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-medium mb-8">Shopping Cart ({cart.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white p-4 rounded-lg shadow-sm flex gap-4"
              >
                <div className="relative w-24 h-24 flex-shrink-0 bg-base-200 rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium truncate pr-4">{item.name}</h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="btn btn-ghost btn-sm btn-circle text-neutral/50 hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {item.size && (
                    <p className="text-sm text-neutral/70 mt-1">Size: {item.size}</p>
                  )}
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="btn btn-square btn-sm btn-outline"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="btn btn-square btn-sm btn-outline"
                        disabled={item.quantity >= 10}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatEuroPrice(item.price * item.quantity)}</p>
                      <p className="text-sm text-neutral/70">{formatEuroPrice(item.price)} each</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="btn btn-ghost btn-sm text-error"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-6 sticky top-8">
              <h2 className="font-medium text-lg">Order Summary</h2>

              {/* Coupon Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="input input-bordered flex-1"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="btn btn-primary"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-error text-xs">{couponError}</p>
                )}
                {appliedCouponCode && (
                  <div className="flex items-center gap-2 text-success text-sm bg-success/5 p-2 rounded">
                    <Gift className="w-4 h-4" />
                    <span>Coupon {appliedCouponCode} applied!</span>
                    <button
                      onClick={removeCoupon}
                      className="btn btn-ghost btn-xs btn-circle ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4">
                <div className="flex justify-between">
                  <span className="text-neutral/70">Subtotal</span>
                  <span>{formatEuroPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral/70">Shipping</span>
                  {subtotal >= 100 ? (
                    <span className="text-success">Free</span>
                  ) : (
                    <span>{formatEuroPrice(shipping)}</span>
                  )}
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatEuroPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg pt-3 border-t">
                  <span>Total</span>
                  <span>{formatEuroPrice(total)}</span>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < 100 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-neutral/70">
                    <Truck className="w-4 h-4" />
                    <span>Free shipping on orders over €100</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(subtotal / 100) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-neutral/70 text-center">
                    Add {formatEuroPrice(100 - subtotal)} more for free shipping
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>

              {/* Additional Info */}
              <div className="text-xs text-center space-y-1 text-neutral/50">
                <p>Secure checkout powered by Stripe</p>
                <p>30-day return policy</p>
                <p>Free shipping over €100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}