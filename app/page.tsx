/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { AnimatedContent } from "@/components/home/AnimatedContent";

async function getProducts() {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/printful/products', {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();
  console.log("Fetched products:", products);
  return <AnimatedContent products={products} />;
}