import { NextResponse } from "next/server";
import { PRINTFUL_API_URL } from "@/utils/env";
import { productCache } from "@/lib/cache";
import { printfulRateLimiter } from "@/lib/rate-limiter";
import { type PrintfulProductResponse, type PrintfulProduct } from "@/types/printful";

const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

export async function GET() {
  try {
    // Check cache first
    const cachedProducts = productCache.get("products");
    if (cachedProducts) {
      return NextResponse.json(cachedProducts);
    }

    // Check rate limit
    const canProceed = await printfulRateLimiter.checkLimit();
    if (!canProceed) {
      const retryAfter = printfulRateLimiter.getNextAllowedTime();
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { 
          status: 429,
          headers: { "Retry-After": Math.ceil(retryAfter / 1000).toString() }
        }
      );
    }

    const response = await fetch(`${PRINTFUL_API_URL}/store/products`, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const products = data.result;

    // Fetch detailed information for each product
    const detailedProducts = await Promise.all(
      products.map(async (item: any) => {
        const detailResponse = await fetch(
          `${PRINTFUL_API_URL}/store/products/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${PRINTFUL_TOKEN}`,
            },
          }
        );

        if (!detailResponse.ok) {
          throw new Error(`HTTP error! status: ${detailResponse.status}`);
        }

        const detailData: PrintfulProductResponse = await detailResponse.json();
        const { sync_product, sync_variants } = detailData.result;

        // Transform the Printful data into our product format
        const transformedProduct: PrintfulProduct = {
          id: sync_product.external_id,
          name: sync_product.name,
          description: "", // Add description if available
          images: sync_variants.map(variant => variant.product.image).filter(Boolean),
          price: parseFloat(sync_variants[0]?.retail_price || "0"),
          currency: sync_variants[0]?.currency || "EUR",
          variants: sync_variants.map(variant => ({
            id: variant.id,
            name: variant.name,
            price: parseFloat(variant.retail_price),
            size: variant.size,
            color: variant.color,
            sku: variant.sku,
            inStock: variant.availability_status === "active"
          })),
          inStock: sync_variants.some(v => v.availability_status === "active"),
          thumbnail: sync_product.thumbnail_url,
          previewImage: sync_variants[0]?.files.find(f => f.type === "preview")?.preview_url || sync_product.thumbnail_url
        };

        return transformedProduct;
      })
    );

    // Cache the successful response
    productCache.set("products", detailedProducts);
    
    return NextResponse.json(detailedProducts);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
