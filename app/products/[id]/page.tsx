"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/app/components/seo";
import { ProductJsonLd } from "@/app/components/productJSONLd";
import { Loader2 } from "lucide-react";
import { formatEuroPrice } from "@/utils/formatters";

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  variants: Variant[];
  category: string;
  inStock: boolean;
  tags: string[];
}

interface Variant {
  id: number;
  name: string;
  price: string;
  size: string;
  currency: string;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  availability_status: string;
}

const ProductSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="relative">
        <div className="aspect-square bg-base-200 animate-pulse rounded-lg"></div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-16 bg-base-200 animate-pulse rounded-lg w-3/4"></div>
        <div className="h-24 bg-base-200 animate-pulse rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-8 bg-base-200 animate-pulse rounded-lg w-1/4"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-12 h-12 bg-base-200 animate-pulse rounded-full"></div>
            ))}
          </div>
        </div>
        <div className="h-12 bg-base-200 animate-pulse rounded-lg mt-4"></div>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-20 bg-base-200 animate-pulse rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [hoveredSize, setHoveredSize] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/printful/products/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setSelectedVariant(data.variants[0]);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (!product || !selectedVariant) {
    return <ProductSkeleton />;
  }

  const handleVariantChange = (variant: Variant) => {
    setImageLoading(true);
    setSelectedVariant(variant);
    setHoveredSize(null);
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart({
        id: selectedVariant.id.toString(),
        name: product.name,
        price: parseFloat(selectedVariant.price),
        quantity: 1,
        image: selectedVariant.thumbnailUrl || product.image,
        variant_id: selectedVariant.id,
      });
    }
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        image={product.image}
        type="product"
      />
      <ProductJsonLd product={product} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative">
            <motion.div
              ref={imageRef}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden bg-base-100 aspect-square"
            >
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-base-200 z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              <Image
                src={selectedVariant.previewUrl || product.image}
                alt={product.name}
                fill
                className="object-contain"
                onLoadingComplete={() => setImageLoading(false)}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="relative h-64 mb-4 flex items-center">
              <h1 className="text-4xl uppercase" style={{ fontWeight: 900 }}>
                {product.name.split(" ").map((word, index) => {
                  if (word === "Okapi") {
                    return <span key={index} className="font-serif">{word} </span>;
                  }
                  return <span className="text-md font-intergral" key={index}>{word} </span>;
                })}
              </h1>
            </div>
            <p className="mb-6 text-neutral-content">{product.description}</p>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-neutral uppercase">Select size</h2>
              <div className="relative flex flex-wrap gap-6">
                <AnimatePresence>
                  <motion.div
                    className="absolute w-12 h-12 rounded-full border-2 border-primary"
                    initial={false}
                    animate={{
                      x: hoveredSize !== null
                        ? `${hoveredSize * 48 + hoveredSize * 24}px`
                        : `${product.variants.findIndex(v => v.id === selectedVariant.id) * 48 +
                        product.variants.findIndex(v => v.id === selectedVariant.id) * 24}px`,
                      opacity: hoveredSize !== null ? 0.5 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                  />
                </AnimatePresence>

                {product.variants.map((variant, index) => (
                  <motion.button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    onHoverStart={() => setHoveredSize(index)}
                    onHoverEnd={() => setHoveredSize(null)}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center
                      ${selectedVariant.id === variant.id ? 'text-primary' : 'text-neutral-content'}`}
                  >
                    {variant.size}
                  </motion.button>
                ))}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={selectedVariant.availability_status !== "active"}
              className={`btn btn-lg ${selectedVariant.availability_status === "active"
                  ? "btn-primary"
                  : "btn-disabled"
                }`}
            >
              {selectedVariant.availability_status === "active"
                ? "Add to Cart"
                : "Out of Stock"}{" "}
              - {formatEuroPrice(parseFloat(selectedVariant.price))}
            </motion.button>
            <div className="mt-4">
              {product.tags?.map((tag) => (
                <span key={tag} className="badge badge-outline mr-2 mb-2">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}