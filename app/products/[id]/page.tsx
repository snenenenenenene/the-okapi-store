'use client';

import { useCartStore } from "@/store/cartStore";
import { formatEuroPrice } from "@/utils/formatters";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Variant {
  id: number;
  sync_variant_id: number;
  name: string;
  price: string;
  size: string;
  currency: string;
  availability_status: string;
  thumbnailUrl: string;
  previewUrl: string;
  color: string;
}

interface PrintfulProduct {
  id: number;
  name: string;
  description: string;
  thumbnail_url: string;
  image: string;
  variants: Variant[];
}

interface SizeGuide {
  product_id: number;
  available_sizes: string[];
  size_tables: {
    type: 'measure_yourself' | 'product_measure' | 'international';
    unit: string;
    description: string;
    image_url?: string;
    image_description?: string;
    measurements: {
      type_label: string;
      values: Array<{
        size: string;
        value?: string;
        min_value?: string;
        max_value?: string;
      }>;
    }[];
  }[];
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  const id = params.id;
  const [product, setProduct] = useState<PrintfulProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [hoveredSize, setHoveredSize] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
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
          // Find the first available variant
          const firstAvailableVariant = data.variants.find(
            (variant: Variant) => variant.availability_status === 'active'
          );
          if (firstAvailableVariant) {
            setSelectedVariant(firstAvailableVariant);
          }
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

    return sizeButtonPositions[index as any] || { x: 0, y: 0 };
  };

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900 dark:text-slate-50" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-2">
        {/* Product Image */}
        <motion.div
          className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 lg:sticky lg:top-32"
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
              src={selectedVariant?.previewUrl || product?.image || ''}
              alt={product?.name || ''}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              onLoadingComplete={() => setImageLoading(false)}
            />
          </motion.div>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-900 dark:text-slate-50" />
            </div>
          )}
        </motion.div>

        {/* Product Details */}
        <div className="space-y-10">
          {/* Title and Price */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {selectedVariant ? formatEuroPrice(parseFloat(selectedVariant.price)) : ''}
              </span>
            </div>
          </div>

          {/* Product Features */}
          <div className="space-y-2">
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                {product.description}
              </li>
            </ul>
          </div>


          {/* Size Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium text-black dark:text-slate-50">
                SIZE: {selectedVariant?.size || 'Select Size'}
              </label>
            </div>

         
            <div className="flex gap-2" ref={sizePickerRef}>

              {product?.variants.map((variant, index) => (
                <motion.button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  onMouseEnter={() => setHoveredSize(index)}
                  onMouseLeave={() => setHoveredSize(null)}
                  disabled={variant.availability_status !== 'active'}
                  className={`relative h-12 w-12 rounded-full text-base font-medium transition-colors ${
                    variant.availability_status !== 'active'
                      ? "cursor-not-allowed opacity-50"
                      : selectedVariant?.id === variant.id
                        ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900"
                        : "text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">
                    {variant.size}
                  </span>
                  {variant.availability_status !== 'active' && (
                    <span className="absolute -bottom-6 text-xs text-slate-500 dark:text-slate-400">
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
              if (selectedVariant && product) {
                const cartItem = {
                  id: String(product.id),
                  variant_id: selectedVariant.id,
                  name: `${product.name} - ${selectedVariant.size}`,
                  price: parseFloat(selectedVariant.price),
                  quantity: 1,
                  image: selectedVariant.previewUrl,
                  size: selectedVariant.size
                };
                addToCart(cartItem);
              }
            }}
            disabled={!selectedVariant || selectedVariant.availability_status !== 'active'}
            className="group relative w-full rounded-xl bg-slate-900 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <span className="flex items-center justify-center gap-x-2">
              <ShoppingBag className="h-5 w-5" />
              {!selectedVariant ? 'Select a Size' :
                selectedVariant.availability_status !== 'active' ? 'Out of Stock' :
                  'Add to Cart'}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}