// app/api/printful/shipping-rates/route.ts
import { NextResponse } from "next/server";

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID; // Required for account-level tokens

export async function POST(req: Request) {
  try {
    const {
      address,
      items,
      currency = "USD",
      locale = "en_US",
    } = await req.json();

    console.log(items);

    // Validate and prepare items
    const validatedItems = items.map((item: any) => ({
      variant_id: item.variant_id, // Use the passed variant_id directly
      quantity: item.quantity,
      value: item.price.toString(), // Convert price to string for Printful
    }));

    // Construct the shipping request payload
    const shippingRequest = {
      recipient: {
        address1: address.address1,
        city: address.city,
        country_code: address.country,
        state_code: address.state,
        zip: address.zip,
        phone: address.phone || undefined,
      },
      items: validatedItems,
      currency,
      locale,
    };

    console.log(
      "Shipping request payload:",
      JSON.stringify(shippingRequest, null, 2)
    );

    // Fetch shipping rates from Printful API
    const response = await fetch(`${PRINTFUL_API_URL}/shipping/rates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PRINTFUL_TOKEN}`,
        "Content-Type": "application/json",
        ...(PRINTFUL_STORE_ID && { "X-PF-Store-Id": PRINTFUL_STORE_ID }),
      },
      body: JSON.stringify(shippingRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error response from Printful:", data);
      throw new Error(
        `Shipping calculation failed: ${data.error?.message || "Unknown error"}`
      );
    }

    console.log("Printful shipping response:", JSON.stringify(data, null, 2));

    // Return formatted shipping rates
    return NextResponse.json(
      data.result.map((rate: any) => ({
        id: rate.id,
        name: rate.name,
        rate: rate.rate,
        min_delivery_days: rate.min_delivery_days,
        max_delivery_days: rate.max_delivery_days,
      }))
    );
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to calculate shipping rates",
      },
      { status: 400 }
    );
  }
}
