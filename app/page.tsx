/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { useEffect } from 'react'
import { ProductCard } from '@/components/productCard'

export default function ProductsPage() {
  const { products, fetchProducts } = useCartStore()

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Products Grid */}
      <section id="products" className="py-12 px-4">
        <div className="container mx-auto">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={item}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}