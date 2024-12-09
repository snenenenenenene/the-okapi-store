'use client';

import { useCartStore } from "@/store/cartStore";
import { formatEuroPrice } from "@/utils/formatters";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 z-40 bg-black"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white p-6 shadow-xl dark:bg-neutral-950 sm:p-8"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                  <ShoppingBag className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />
                  <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-50">Shopping Cart</h2>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50">
                    {items?.length || 0}
                  </span>
                </div>
                <button
                  onClick={toggleCart}
                  className="text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                >
                  <span className="sr-only">Close cart</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-8 flex-1 overflow-y-auto">
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {items?.map((item) => (
                    <motion.li
                      key={`${item.id}-${item.size}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-x-4 py-6"
                    >
                      <div className="relative h-24 w-24 flex-none overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Size: {item.size}</p>
                          </div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                            {formatEuroPrice(item.price)}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="rounded-md bg-neutral-100 p-1 text-neutral-500 transition-colors hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="rounded-md bg-neutral-100 p-1 text-neutral-500 transition-colors hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {items?.length > 0 ? (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
                    <div className="space-y-1">
                      <div className="flex justify-between text-base font-medium text-neutral-900 dark:text-neutral-50">
                        <p>Subtotal</p>
                        <p>{formatEuroPrice(total)}</p>
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Shipping and taxes calculated at checkout
                      </p>
                    </div>
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-2 rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Clear cart</span>
                    </button>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={toggleCart}
                    className="flex w-full items-center justify-center rounded-xl bg-primary-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-600"
                  >
                    Checkout
                  </Link>
                </div>
              ) : (
                <div className="mt-8 flex flex-1 flex-col items-center justify-center space-y-4">
                  <ShoppingBag className="h-12 w-12 text-neutral-300 dark:text-neutral-700" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50">
                      Your cart is empty
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Start adding some items to your cart
                    </p>
                  </div>
                  <button
                    onClick={toggleCart}
                    className="rounded-xl bg-primary-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-600"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}