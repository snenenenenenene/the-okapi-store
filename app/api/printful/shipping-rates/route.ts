import { NextResponse } from "next/server";

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

export async function POST(req: Request) {
  try {
    const { address, items } = await req.json();

    

    if (!PRINTFUL_TOKEN) {
      throw new Error("Printful API key is not configured");
    }

    if (!address || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Validate items have variant_id
    if (items.some((item: any) => !item.variant_id)) {
      throw new Error("All items must have a variant_id");
    }

    const printfulItems = items.map((item: any) => ({
      variant_id: parseInt(String(item.variant_id)),
      sync_variant_id: parseInt(String(item.variant_id)),
      quantity: item.quantity,
    }));

    

    const requestBody = {
      recipient: {
        address1: address.address1,
        address2: address.address2 || "",
        city: address.city,
        state_code: address.state || "",
        country_code: address.country,
        zip: address.zip,
      },
      items: printfulItems,
      currency: "EUR",
    };

    

    const response = await fetch(`${PRINTFUL_API_URL}/shipping/rates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PRINTFUL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    

    if (!response.ok) {
      throw new Error(
        responseData.error?.message || "Failed to fetch shipping rates"
      );
    }

    if (!responseData.result || !Array.isArray(responseData.result)) {
      throw new Error("Invalid response from Printful");
    }

    const formattedRates = responseData.result.map((rate) => ({
      id: rate.id,
      name: rate.name,
      rate: parseFloat(rate.rate),
      min_delivery_days: rate.min_delivery_days,
      max_delivery_days: rate.max_delivery_days,
    }));

    return NextResponse.json(formattedRates);
  } catch (error) {
    console.error("Shipping rates error:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate shipping rates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
