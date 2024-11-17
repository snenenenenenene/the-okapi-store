// scripts/generate-sitemap.ts
import prisma from "@/lib/prisma";
import { writeFileSync } from "fs";

async function generateSitemap() {
  // Get all products from the database
  const products = await prisma.product.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });

  // Static pages with their update frequency and priority
  const staticPages = [
    { url: "", changefreq: "daily", priority: 1.0 },
    { url: "about", changefreq: "monthly", priority: 0.8 },
    { url: "products", changefreq: "daily", priority: 0.9 },
    { url: "shipping", changefreq: "monthly", priority: 0.7 },
    { url: "returns", changefreq: "monthly", priority: 0.7 },
    { url: "privacy", changefreq: "monthly", priority: 0.5 },
    { url: "terms", changefreq: "monthly", priority: 0.5 },
  ];

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://the-okapi-webstore.vercel.app/";

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${staticPages
    .map(
      (page) => `
    <url>
      <loc>${baseUrl}/${page.url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`
    )
    .join("")}
  ${products
    .map(
      (product) => `
    <url>
      <loc>${baseUrl}/products/${product.id}</loc>
      <lastmod>${product.updatedAt.toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
    )
    .join("")}
</urlset>`;

  writeFileSync("public/sitemap.xml", sitemap);
  console.log("Sitemap generated successfully");
}

generateSitemap().catch((error) => {
  console.error("Error generating sitemap:", error);
  process.exit(1);
});
