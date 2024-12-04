'use client';

import { Container } from "@/components";
import { siteConfig } from "@/config/site";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Suspense } from 'react';
import { ProductGrid } from "../product/ProductGrid";
import { type PrintfulProduct } from "@/types/printful";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface AnimatedContentProps {
  products: PrintfulProduct[];
}

export function AnimatedContent({ products }: AnimatedContentProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Container>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={staggerChildren}
        className="space-y-8 py-4 sm:space-y-12 sm:py-8 md:py-12 lg:py-16"
      >
        <motion.div variants={fadeIn} className="space-y-3 sm:space-y-4">
          <h1 className="font-serif text-3xl font-medium text-sandstone-900 dark:text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="max-w-[42rem] text-base text-sandstone-600 dark:text-slate-300 sm:text-lg md:text-xl">
            {siteConfig.description}
          </p>
        </motion.div>

        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="h-32 w-32 animate-pulse rounded-lg bg-sandstone-100 dark:bg-slate-800" />
            </div>
          }
        >
          <ProductGrid products={products} />
        </Suspense>
      </motion.div>
    </Container>
  );
}
