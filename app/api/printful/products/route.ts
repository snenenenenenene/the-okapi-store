import { NextResponse } from "next/server";

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

export async function GET() {
  try {
    const response = await fetch(`${PRINTFUL_API_URL}/store/products`, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch products from Printful");
    }

    const data = await response.json();

    // Fetch detailed information for each product
    const detailedProducts = await Promise.all(
      data.result.map(async (item: any) => {
        const detailResponse = await fetch(
          `${PRINTFUL_API_URL}/store/products/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${PRINTFUL_TOKEN}`,
            },
          }
        );

        if (!detailResponse.ok) {
          console.error(`Failed to fetch details for product ${item.id}`);
          return null;
        }

        const detailData = await detailResponse.json();
        const variant = detailData.result.sync_variants[0]; // Assuming the first variant

        // Calculate base price (removing VAT from retail price)
        const retailPrice = parseFloat(variant.retail_price);
        const basePrice = retailPrice / 1.23; // Remove 23% VAT

        return {
          id: item.id,
          variant_id: variant.id,
          name: item.name,
          description: item.description || "No description available",
          price: basePrice, // Store the base price without VAT
          retail_price: retailPrice, // Store the full retail price for reference
          currency: variant.currency,
          image: item.thumbnail_url,
          variants: detailData.result.sync_variants.map((v: any) => ({
            id: v.id,
            name: v.name,
            price: parseFloat(v.retail_price) / 1.23, // Remove VAT from variant prices
            retail_price: parseFloat(v.retail_price), // Store full retail price
            size: v.size,
            inStock: v.availability_status === "available",
          })),
          category: item.type_name || "No category available",
          inStock: variant.availability_status === "available",
        };
      })
    );

    // Filter out any null results (failed fetches)
    const products = detailedProducts.filter((product) => product !== null);
    

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products from Printful:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
