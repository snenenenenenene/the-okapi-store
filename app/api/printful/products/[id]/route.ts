/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `${PRINTFUL_API_URL}/store/products/${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${PRINTFUL_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch product from Printful");
    }

    const json = await response.json();
    const product_data = json.result;

    console.log("Fetched product data from Printful:", product_data);

    const product = {
      id: product_data.sync_product.id,
      name: product_data.sync_product.name,
      description:
        product_data.sync_product.description ||
        "A unique piece from The Okapi Store",
      thumbnail_url: product_data.sync_product.thumbnail_url,
      image: product_data.sync_product.thumbnail_url,
      variants: product_data.sync_variants.map((variant: any) => ({
        id: variant.variant_id,
        sync_variant_id: variant.sync_product_id,
        external_id: variant.external_id,
        name: variant.name,
        price: variant.retail_price,
        size: variant.size,
        currency: variant.currency,
        availability_status: variant.availability_status,
        thumbnailUrl:
          variant.files.find((file: any) => file.type === "preview")
            ?.thumbnail_url || null,
        previewUrl:
          variant.files.find((file: any) => file.type === "preview")
            ?.preview_url || null,
        files: variant.files,
        color: variant.color,
      })),
    };

    console.log("Processed product data:", product);

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product from Printful:", error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
