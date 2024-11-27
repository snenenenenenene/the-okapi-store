"use client";

import { useCartStore } from "@/store/cartStore";
import { formatEuroPrice } from "@/utils/formatters";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Variant {
  id: number;
  name: string;
  price: string;
  size: string;
  currency: string;
  availability_status: string;
  thumbnailUrl?: string;
  previewUrl?: string;
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [hoveredSize, setHoveredSize] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [productImage, setProductImage] = useState<string>('');
  const sizePickerRef = useRef<HTMLDivElement>(null);
  const [sizeButtonPositions, setSizeButtonPositions] = useState<{ [key: number]: { x: number, y: number } }>({});
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/printful/products/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
            setProductImage(data.variants[0]?.previewUrl || data.image);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    fetchProduct();
  }, [params.id]);

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

  const handleAddToCart = () => {
    if (selectedVariant) {
      console.log("Selected variant:", selectedVariant);

      const cartItem = {
        id: product.id,
        variant_id: selectedVariant.id,
        name: `${product.name} - ${selectedVariant.size}`,
        price: parseFloat(selectedVariant.price),
        quantity: 1,
        image: productImage,
        size: selectedVariant.size
      };

      console.log("Adding to cart:", cartItem);
      addToCart(cartItem);
    }
  };

  const handleVariantChange = (variant: Variant) => {
    console.log("Changing variant to:", variant);
    setSelectedVariant(variant);
    if (variant.previewUrl) {
      setProductImage(variant.previewUrl);
    }
    setHoveredSize(null);
  };

  const getIndicatorPosition = () => {
    const index = hoveredSize !== null
      ? hoveredSize
      : product.variants.findIndex((v: Variant) => v.id === selectedVariant?.id);

    return sizeButtonPositions[index] || { x: 0, y: 0 };
  };

  if (!product || !selectedVariant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* <SEO
        title={product.name}
        description={product.description}
        image={productImage}
        type="website"
        openGraph={{
          type: "website",
          title: product.name,
          description: product.description,
          images: [
            {
              url: productImage,
              alt: product.name
            }
          ]
        }}
      /> */}
      {/* <ProductJsonLd product={product} /> */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative">
            <motion.div
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
                src={productImage}
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
                {product.name.split(" ").map((word: string, index: number) => {
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
              <div ref={sizePickerRef} className="relative flex flex-wrap gap-6">
                <AnimatePresence>
                  <motion.div
                    className="absolute w-12 h-12 rounded-full border-2 border-primary"
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
                </AnimatePresence>

                {product.variants.map((variant: Variant, index: number) => (
                  <motion.button
                    key={variant.id}
                    className="size-button relative w-12 h-12 rounded-full flex items-center justify-center"
                    onClick={() => handleVariantChange(variant)}
                    onHoverStart={() => setHoveredSize(index)}
                    onHoverEnd={() => setHoveredSize(null)}
                    style={{
                      color: selectedVariant.id === variant.id ? '#8D6E63' : '#999'
                    }}
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
              {product.tags?.map((tag: string) => (
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