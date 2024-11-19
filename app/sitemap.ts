// app/sitemap.ts
import prisma from "@/lib/prisma";
import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://theokapistore.com";

export async function generateSitemaps() {
  // Count total products in the database
  const totalProducts = await prisma.product.count();

  // Google's limit is 50,000 URLs per sitemap
  const productsPerSitemap = 50000;
  const totalSitemaps = Math.ceil(totalProducts / productsPerSitemap);

  // Generate array of sitemap IDs
  return Array.from({ length: totalSitemaps }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const productsPerPage = 50000;
  const start = id * productsPerPage;

  // Fetch paginated products
  const products = await prisma.product.findMany({
    skip: start,
    take: productsPerPage,
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  // Static pages
  const staticPages = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/returns`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // Add product pages with image support
  const productPages = products.map((product) => ({
    url: `${BASE_URL}/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    images: [
      {
        url: `${BASE_URL}/images/products/${product.id}.jpg`,
        title: `Product ${product.id}`,
      },
    ],
  }));

  // Include static pages only in the first sitemap
  const pages = id === 0 ? [...staticPages, ...productPages] : productPages;

  return pages;
}
