'use client';

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { trackEvent } from "@/utils/analytics";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { type Product } from "@/types/product";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface HomePageProps {
  initialProducts: Product[];
}

export function HomePage({ initialProducts }: HomePageProps) {
  const cartProducts = useCartStore((state) => state.products);
  const fetchProducts = useCartStore((state) => state.fetchProducts);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const products = cartProducts.length > 0 ? cartProducts : initialProducts;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        </div>

        <Container className="relative z-10 text-center space-y-8">
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.2 } },
            }}
            className="text-5xl md:text-7xl font-bold tracking-tight"
          >
            {siteConfig.name}
          </motion.h1>
          
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.3 } },
            }}
            className="text-xl text-base-content/70 max-w-2xl mx-auto"
          >
            {siteConfig.description}
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.4 } },
            }}
            className="flex justify-center gap-4"
          >
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary btn-lg"
              >
                Shop Now
              </motion.button>
            </Link>
            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-outline btn-lg"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>
        </Container>

        {/* Animated background shapes */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl"
        />
      </motion.section>

      {/* Featured Products */}
      <section className="py-24 bg-base-100">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="space-y-12"
          >
            <motion.div variants={fadeIn} className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <p className="text-base-content/70 max-w-2xl mx-auto">
                Discover our handpicked selection of unique products that combine style, quality, and innovation.
              </p>
            </motion.div>

            <motion.div
              variants={staggerChildren}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {products.length === 0 ? (
                <p className="text-neutral text-center col-span-full">No products found.</p>
              ) : (
                products.map((product: any) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <Link href={`/products/${product.id}`}
                      onClick={() => {
                        trackEvent.viewProduct(product);
                      }}
                    >
                      <ProductCard product={product} />
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-base-200">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              {
                title: "Quality Products",
                description: "Carefully curated selection of premium items.",
                icon: "✨",
              },
              {
                title: "Fast Shipping",
                description: "Quick delivery to your doorstep.",
                icon: "🚚",
              },
              {
                title: "24/7 Support",
                description: "Always here to help when you need us.",
                icon: "💬",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className="text-center space-y-4 p-8 rounded-xl bg-base-100 shadow-sm"
              >
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-base-content/70">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-base-100">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Newsletter />
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
