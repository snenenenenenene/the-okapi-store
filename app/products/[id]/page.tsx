"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import { Seo } from "@/app/components/seo";
import { ProductJsonLd } from "@/app/components/productJSONLd";

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

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  // const [isZoomed, setIsZoomed] = useState(false);
  // const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/printful/products/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setSelectedVariant(data.variants[0]); // Set the first variant as default
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (!product || !selectedVariant) {
    return <div>Loading...</div>;
  }

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariant(variant);
  };

  console.log(product)

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

  // const handleImageHover = (event: React.MouseEvent<HTMLDivElement>) => {
  //   if (imageRef.current) {
  //     const rect = imageRef.current.getBoundingClientRect();
  //     const x = event.clientX - rect.left;
  //     const y = event.clientY - rect.top;

  //     // Get the relative position of the mouse within the image container (0 to 1)
  //     // const xPos = x / rect.width;
  //     // const yPos = y / rect.height;

  //     // setZoomPosition({ x: xPos, y: yPos });
  //     // setIsZoomed(true);
  //   }
  // };

  // const handleImageLeave = () => {
  //   // setIsZoomed(false);
  // };

  return (
    <>
      <Seo
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
              className="relative overflow-hidden bg-base-100"
            // onMouseMove={handleImageHover}
            // onMouseLeave={handleImageLeave}
            // style={{
            //   cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='white' /%3E%3Cpath d='M10 10 L22 22 M22 10 L10 22' stroke='black' stroke-width='2'/%3E%3C/svg%3E") 16 16, auto`
            // }}
            >
              <Image
                src={selectedVariant.previewUrl || product.image}
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Zoomed Image */}
            <div className="relative w-full h-64 overflow-hidden mb-4 flex items-center">
              <h1 className="text-4xl uppercase" style={{
                fontWeight: 900
              }}>
                {/* if the word Okapi occurs then make that classname font-serif. only make the word Okapi serif */}
                {
                  product.name.split(" ").map((word, index) => {
                    if (word === "Okapi") {
                      return <span key={index} className="font-serif">{word} </span>
                    }
                    return <span className="text-md font-intergral" key={index}>{word} </span>
                  }
                  )
                }
              </h1>
              {/* <AnimatePresence>
              {isZoomed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                  style={{
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "200%", // Adjusted zoom size
                      height: "200%",
                      top: `${-(zoomPosition.y * 100) + 50}%`, // Center cursor
                      left: `${-(zoomPosition.x * 100) + 50}%`, // Center cursor
                      transform: "scale(1.25)", // Slight zoom out
                      transformOrigin: "center",
                    }}
                  >
                    <img
                      src={selectedVariant.previewUrl || product.image}
                      className="-translate-x-24"
                      alt={`${product.name} zoomed`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence> */}
            </div>
            <p className="mb-6 text-neutral-content">{product.description}</p>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-neutral uppercase">Select size</h2>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <motion.button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`btn font-serif ${selectedVariant.id === variant.id
                      ? "btn-primary"
                      : "btn-outline"
                      }`}
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
              - {selectedVariant.price} {selectedVariant.currency}
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
