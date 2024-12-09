'use client';

import { type PrintfulProduct } from "@/types/printful";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState } from "react";
import { formatEuroPrice } from "@/utils/formatters";

interface ProductCardProps {
  product: PrintfulProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left - width / 2) * 0.5);
    y.set((clientY - top - height / 2) * 0.5);
  }

  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);

  return (
    <motion.div
      style={{
        perspective: 1000,
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
      }}
      className="group relative"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-300/90 dark:bg-vintage-wash"
      >
        {product.image && (
          <motion.div
            layoutId={`product-image-${product.id}`}
            className="relative w-[90%] h-[90%] mx-auto my-auto top-[5%]"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-75"
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </motion.div>

      <div className="mt-4 space-y-1">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <p className="text-base font-medium text-slate-900 dark:text-slate-50">
            {formatEuroPrice(product.retail_price)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Excl. VAT
          </p>
        </div>
      </div>

      <Link
        href={`/products/${product.id}`}
        className="absolute inset-0"
        aria-label={`View ${product.name}`}
      />
    </motion.div>
  );
}
