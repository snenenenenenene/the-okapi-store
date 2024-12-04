'use client';

import { type PrintfulProduct } from "@/types/printful";
import { ProductCard } from "./ProductCard";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProductGridProps {
  products: PrintfulProduct[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function ProductGrid({ products }: ProductGridProps) {
  if (!products?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-vintage-black/80">No products found.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={fadeInUp}>
          <Link href={`/products/${product.id}`}>
            <ProductCard product={product} />
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

ProductGrid.displayName = "ProductGrid";
