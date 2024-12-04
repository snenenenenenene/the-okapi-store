'use client';

import { useCartStore } from '@/store/cartStore';
import { formatEuroPrice } from '@/utils/formatters';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Gift, Loader2, Minus, Plus, ShoppingBag, Truck, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItemProps {
  item: CartItem;
  onQuantityChange: (id: string, variantId: number, quantity: number) => void;
  onRemove: (id: string, variantId: number) => void;
  removingItemId: string | null;
}

function CartItem({ item, onQuantityChange, onRemove, removingItemId }: CartItemProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });
  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left - width / 2) * 0.5);
    y.set((clientY - top - height / 2) * 0.5);
  }

  return (
    <div className="flex items-center space-x-4 p-4">
      <motion.div
        style={{ perspective: 1000 }}
        onMouseMove={onMouseMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        className="relative h-20 w-20 flex-shrink-0"
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="h-full w-full overflow-hidden rounded-lg bg-sandstone-300/90 dark:bg-vintage-wash"
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </motion.div>
      </motion.div>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-medium text-sandstone-900 dark:text-slate-50">
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-sandstone-600 dark:text-slate-400">
              Size: {item.selectedSize}
            </p>
          </div>
          <p className="text-sm font-medium text-sandstone-900 dark:text-slate-50">
            {formatEuroPrice(item.price)}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onQuantityChange(item.id, item.variantId, item.quantity - 1)}
              className="rounded-md p-1 text-sandstone-600 hover:bg-sandstone-400/50 hover:text-sandstone-900 dark:text-slate-400 dark:hover:bg-vintage-black/50 dark:hover:text-slate-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm text-sandstone-900 dark:text-slate-50 w-6 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.id, item.variantId, item.quantity + 1)}
              className="rounded-md p-1 text-sandstone-600 hover:bg-sandstone-400/50 hover:text-sandstone-900 dark:text-slate-400 dark:hover:bg-vintage-black/50 dark:hover:text-slate-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => onRemove(item.id, item.variantId)}
            className="text-sandstone-600 hover:text-sandstone-900 dark:text-slate-400 dark:hover:text-slate-50"
            disabled={removingItemId === item.id}
          >
            {removingItemId === item.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Cart({ isOpen, onClose }: CartProps) {
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

  console.log(cart)
  const [isLoading, setIsLoading] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const cartRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleQuantityChange = (itemId: string, variantId: number, newQuantity: number) => {
    // Only update if the new quantity is within bounds
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateCartItemQuantity(itemId, variantId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: string, variantId: number) => {
    setRemovingItemId(itemId);
    await removeFromCart(itemId, variantId);
    setRemovingItemId(null);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;

    setIsLoading(true);
    setCouponError('');

    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (error) {
      setCouponError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            ref={cartRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-sandstone-300 p-6 shadow-xl dark:bg-vintage-black"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-medium text-sandstone-900 dark:text-slate-50">Shopping Cart</h2>
                <button onClick={onClose} className="text-sandstone-600 dark:text-slate-400 hover:text-sandstone-900 dark:hover:text-slate-50">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sandstone-600 dark:text-slate-400">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
                    {cart.map((item) => (
                      <CartItem
                        key={`${item.id}-${item.variantId}`}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemoveItem}
                        removingItemId={removingItemId}
                      />
                    ))}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 rounded-lg border border-sandstone-200 bg-transparent px-4 py-2 text-sm placeholder-sandstone-500 dark:border-slate-800 dark:placeholder-slate-400"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isLoading || !couponCode}
                        className="rounded-lg bg-sandstone-900 px-4 py-2 text-sm font-medium text-white hover:bg-sandstone-800 disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-red-500">{couponError}</p>
                    )}
                    {appliedCouponCode && (
                      <div className="flex items-center justify-between rounded-lg bg-sandstone-100 p-4 dark:bg-slate-800">
                        <div className="flex items-center space-x-2">
                          <Gift className="h-5 w-5 text-sandstone-900 dark:text-slate-50" />
                          <p className="text-sm font-medium text-sandstone-900 dark:text-slate-50">
                            Coupon applied: {appliedCouponCode}
                          </p>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-sm text-sandstone-500 hover:text-sandstone-900 dark:text-slate-400 dark:hover:text-slate-50"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    <div className="space-y-2 border-t border-sandstone-200 pt-4 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-sandstone-600 dark:text-slate-400">
                          Subtotal
                        </p>
                        <p className="text-sm font-medium text-sandstone-900 dark:text-slate-50">
                          {formatEuroPrice(getSubtotal())}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-5 w-5 text-sandstone-600 dark:text-slate-400" />
                          <p className="text-sm text-sandstone-600 dark:text-slate-400">
                            Shipping
                          </p>
                        </div>
                        <p className="text-sm font-medium text-sandstone-900 dark:text-slate-50">
                          {formatEuroPrice(getShippingCost())}
                        </p>
                      </div>
                      {getDiscount() > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Gift className="h-5 w-5 text-sandstone-600 dark:text-slate-400" />
                            <p className="text-sm text-sandstone-600 dark:text-slate-400">
                              Discount
                            </p>
                          </div>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            -{formatEuroPrice(getDiscount())}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t border-sandstone-200 pt-2 dark:border-slate-800">
                        <p className="text-base font-medium text-sandstone-900 dark:text-slate-50">
                          Total
                        </p>
                        <p className="text-base font-medium text-sandstone-900 dark:text-slate-50">
                          {formatEuroPrice(getTotalPrice())}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        router.push('/checkout');
                      }}
                      className="w-full rounded-lg bg-sandstone-900 px-4 py-3 text-base font-medium text-white hover:bg-sandstone-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}