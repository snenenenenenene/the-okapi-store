'use client';

import { useCartStore } from "@/store/cartStore";
import { formatEuroPrice } from "@/utils/formatters";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Cart() {
  const [mounted, setMounted] = useState(false);
  const { cart: items, isCartOpen, toggleCart, removeFromCart, updateCartItemQuantity: updateQuantity, clearCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items ? items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
          onClick={toggleCart}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 h-full w-full max-w-md bg-white p-6 shadow-xl dark:bg-neutral-900"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
                <div className="flex items-center gap-x-3">
                  <ShoppingCart className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />
                  <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-50">Shopping Cart</h2>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50">
                    {items?.length || 0}
                  </span>
                </div>
                <button
                  onClick={toggleCart}
                  className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4">
                {items?.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4">
                    <ShoppingBag className="h-16 w-16 text-neutral-300 dark:text-neutral-700" />
                    <p className="text-center text-neutral-600 dark:text-neutral-400">
                      Your cart is empty
                    </p>
                    <button
                      onClick={toggleCart}
                      className="rounded-xl bg-slate-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items?.map((item) => (
                      <div
                        key={item.id + item.size}
                        className="flex items-center gap-4 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                      >
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                {item.name}
                              </h3>
                              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                Size: {item.size}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                              {formatEuroPrice(item.price)}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="rounded p-1 text-neutral-600 hover:bg-neutral-100 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items?.length > 0 && (
                <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-base font-medium text-neutral-900 dark:text-neutral-50">
                    <p>Subtotal</p>
                    <p>{formatEuroPrice(total)}</p>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Shipping and taxes calculated at checkout
                  </p>
                  <Link
                    href="/checkout"
                    onClick={toggleCart}
                    className="mt-4 flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    Checkout
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}