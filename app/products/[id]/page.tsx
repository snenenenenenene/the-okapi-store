"use client";

import { useCartStore } from "@/store/cartStore";
import { formatEuroPrice } from "@/utils/formatters";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ChevronDown, Loader2, Ruler, ShoppingBag, Truck, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, use } from "react";
import * as Accordion from '@radix-ui/react-accordion';

interface Variant {
  id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  inStock: boolean;
}

interface SizeGuide {
  size: string;
  chest: string;
  length: string;
  shoulders: string;
}

const sizeGuide: SizeGuide[] = [
  { size: "S", chest: "36-38", length: "27", shoulders: "17" },
  { size: "M", chest: "38-40", length: "28", shoulders: "18" },
  { size: "L", chest: "40-42", length: "29", shoulders: "19" },
  { size: "XL", chest: "42-44", length: "30", shoulders: "20" },
];

export default function ProductDetail({ params }: { params: { id: string } }) {
  const id = use(params).id;
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [hoveredSize, setHoveredSize] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sizePickerRef = useRef<HTMLDivElement>(null);
  const [sizeButtonPositions, setSizeButtonPositions] = useState<{ [key: number]: { x: number, y: number } }>({});
  const addToCart = useCartStore((state) => state.addToCart);

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/printful/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const updateButtonPositions = () => {
      if (!sizePickerRef.current) return;

      const positions: { [key: number]: { x: number, y: number } } = {};
      const sizeButtons = sizePickerRef.current.querySelectorAll('.size-button');
      const containerRect = sizePickerRef.current.getBoundingClientRect();

      sizeButtons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        positions[index] = {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top
        };
      });

      setSizeButtonPositions(positions);
    };

    updateButtonPositions();
    window.addEventListener('resize', updateButtonPositions);

    return () => window.removeEventListener('resize', updateButtonPositions);
  }, [product]);

  const getIndicatorPosition = () => {
    const index = hoveredSize !== null
      ? hoveredSize
      : product?.variants.findIndex((v: Variant) => v.id === selectedVariant?.id);

    return sizeButtonPositions[index] || { x: 0, y: 0 };
  };

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sandstone-900 dark:text-slate-50" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-2">
        {/* Product Image */}
        <motion.div 
          className="relative aspect-square overflow-hidden rounded-2xl bg-sandstone-100/80 dark:bg-slate-800/50 lg:sticky lg:top-32"
          onMouseMove={onMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            x.set(0);
            y.set(0);
          }}
          style={{
            perspective: 1000,
          }}
        >
          <motion.div
            layoutId={`product-image-${id}`}
            className="relative h-full w-full"
            style={{
              rotateX,
              rotateY,
              transition: "all 0.1s linear",
            }}
          >
            <Image
              src={product.previewImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              onLoadingComplete={() => setImageLoading(false)}
            />
          </motion.div>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-sandstone-900 dark:text-slate-50" />
            </div>
          )}
        </motion.div>

        {/* Product Details */}
        <div className="space-y-10">
          {/* Title and Price */}
          <div className="space-y-4">
            <h1 className="text-4xl font-medium tracking-tight text-sandstone-900 dark:text-slate-50">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-x-2">
              <p className="text-2xl font-medium text-sandstone-900 dark:text-slate-50">
                {formatEuroPrice(product.price)}
              </p>
              {product.compareAtPrice && (
                <p className="text-lg text-sandstone-500 line-through dark:text-slate-400">
                  {formatEuroPrice(product.compareAtPrice)}
                </p>
              )}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-sandstone-900 dark:text-slate-50">Size</span>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-sm text-sandstone-500 underline hover:text-sandstone-900 dark:text-slate-400 dark:hover:text-slate-50"
              >
                Size Guide
              </button>
            </div>
            <div className="flex gap-4" ref={sizePickerRef}>
              <AnimatePresence>
                {selectedVariant && (
                  <motion.div
                    className="absolute h-12 w-12 rounded-full border-2 border-sandstone-900 dark:border-slate-50"
                    initial={false}
                    animate={{
                      x: getIndicatorPosition().x,
                      y: getIndicatorPosition().y,
                      opacity: hoveredSize !== null ? 0.5 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                  />
                )}
              </AnimatePresence>

              {product.variants.map((variant, index) => (
                <motion.button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  onMouseEnter={() => setHoveredSize(index)}
                  onMouseLeave={() => setHoveredSize(null)}
                  disabled={!variant.inStock}
                  className={`size-button relative h-12 w-12 rounded-full text-base font-medium transition-colors ${
                    !variant.inStock
                      ? "cursor-not-allowed opacity-50"
                      : selectedVariant?.id === variant.id
                      ? "text-sandstone-900 dark:text-slate-50"
                      : "text-sandstone-500 hover:text-sandstone-900 dark:text-slate-400 dark:hover:text-slate-50"
                  }`}
                >
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">{variant.size}</span>
                  {!variant.inStock && (
                    <span className="absolute -bottom-6 text-xs text-sandstone-500 dark:text-slate-400">
                      Sold Out
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => {
              if (selectedVariant) {
                addToCart({
                  id: product.id,
                  variantId: selectedVariant.id,
                  name: product.name,
                  price: product.price,
                  size: selectedVariant.size,
                  image: product.previewImage,
                });
              }
            }}
            disabled={!selectedVariant}
            className="group relative w-full rounded-xl bg-sandstone-900 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-sandstone-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <span className="flex items-center justify-center gap-x-2">
              <ShoppingBag className="h-5 w-5" />
              {selectedVariant ? 'Add to Cart' : 'Select a Size'}
            </span>
          </button>

          {/* Product Info */}
          <div className="space-y-6 pt-10">
            <Accordion.Root type="single" collapsible className="space-y-6">
              <Accordion.Item value="description" className="overflow-hidden">
                <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left text-lg font-medium text-sandstone-900 transition-colors hover:text-sandstone-600 dark:text-slate-50 dark:hover:text-slate-300">
                  Product Details
                  <ChevronDown className="h-5 w-5 transform transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="pb-6 pt-4">
                    <div className="prose prose-sandstone dark:prose-invert">
                      <p className="text-sandstone-600 dark:text-slate-400">
                        {product.description}
                      </p>
                      <ul className="mt-4 space-y-2 text-sandstone-600 dark:text-slate-400">
                        <li>• 100% organic cotton</li>
                        <li>• Relaxed fit</li>
                        <li>• Machine washable</li>
                        <li>• Made in Portugal</li>
                      </ul>
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="shipping" className="overflow-hidden">
                <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left text-lg font-medium text-sandstone-900 transition-colors hover:text-sandstone-600 dark:text-slate-50 dark:hover:text-slate-300">
                  Shipping & Returns
                  <ChevronDown className="h-5 w-5 transform transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="pb-6 pt-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-x-4">
                        <Truck className="h-6 w-6 text-sandstone-900 dark:text-slate-50" />
                        <div>
                          <p className="font-medium text-sandstone-900 dark:text-slate-50">Free Shipping</p>
                          <p className="text-sm text-sandstone-600 dark:text-slate-400">2-5 business days</p>
                        </div>
                      </div>
                      <p className="text-sm text-sandstone-600 dark:text-slate-400">
                        Free returns within 30 days. See our <a href="/returns" className="underline hover:text-sandstone-900 dark:hover:text-slate-50">return policy</a> for more details.
                      </p>
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuide(false)}
              className="fixed inset-0 z-40 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] overflow-y-auto bg-white p-6 shadow-lg dark:bg-slate-900 sm:rounded-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-sandstone-900 dark:text-slate-50">
                  Size Guide
                </h3>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="text-sandstone-500 hover:text-sandstone-900 dark:text-slate-400 dark:hover:text-slate-50"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-x-2 text-sm text-sandstone-600 dark:text-slate-400">
                  <Ruler className="h-4 w-4" />
                  <span>Measurements in inches</span>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2 text-sm font-medium text-sandstone-900 dark:text-slate-50">Size</th>
                      <th className="py-2 text-sm font-medium text-sandstone-900 dark:text-slate-50">Chest</th>
                      <th className="py-2 text-sm font-medium text-sandstone-900 dark:text-slate-50">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sandstone-100 dark:divide-slate-800">
                    {sizeGuide.map((size) => (
                      <tr key={size.size}>
                        <td className="py-2 text-sm text-sandstone-600 dark:text-slate-400">{size.size}</td>
                        <td className="py-2 text-sm text-sandstone-600 dark:text-slate-400">{size.chest}"</td>
                        <td className="py-2 text-sm text-sandstone-600 dark:text-slate-400">{size.length}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}