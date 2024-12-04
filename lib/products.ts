import { type Product } from "@/types/product";
import { prisma } from "@/lib/prisma";

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        featured: true,
      },
      take: 6,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return products.map(product => ({
      ...product,
      images: [product.image], // Convert single image to array for compatibility
      price: Number(product.price), // Ensure price is a number
      variants: [], // Add variants if needed
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}
