import { NextResponse } from "next/server";
import { PRINTFUL_API_URL } from "@/utils/env";
import { type PrintfulProductResponse } from "@/types/printful";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First get all products to find the one with matching external_id
    const allProductsResponse = await fetch(`${PRINTFUL_API_URL}/store/products`, {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_TOKEN}`,
      },
    });

    if (!allProductsResponse.ok) {
      throw new Error(`HTTP error! status: ${allProductsResponse.status}`);
    }

    const allProducts = await allProductsResponse.json();
    const product = allProducts.result.find((p: any) => p.external_id === params.id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Now get the detailed product info
    const detailResponse = await fetch(
      `${PRINTFUL_API_URL}/store/products/${product.id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTFUL_TOKEN}`,
        },
      }
    );

    if (!detailResponse.ok) {
      throw new Error(`HTTP error! status: ${detailResponse.status}`);
    }

    const detailData: PrintfulProductResponse = await detailResponse.json();
    const { sync_product, sync_variants } = detailData.result;

    return NextResponse.json({
      id: sync_product.external_id,
      name: sync_product.name,
      description: sync_product.description || "A unique piece from The Okapi Store",
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
    });

  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
