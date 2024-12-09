// /app/api/printful/shipping-rates/route.ts

import { NextResponse } from "next/server";
import { PRINTFUL_API_URL } from "@/utils/env";

export async function POST(req: Request) {
  try {
    const { address, items } = await req.json();

    if (!address || !items) {
      return NextResponse.json(
        { error: "Address and items are required" },
        { status: 400 }
      );
    }

    // Format address for Printful
    const recipient = {
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      state_code: address.state,
      country_code: address.country,
      zip: address.zip,
    };

    // Format items for Printful
    const printfulItems = items.map((item: any) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
    }));

    // Call Printful shipping rates API
    const response = await fetch(`${PRINTFUL_API_URL}/shipping/rates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient,
        items: printfulItems,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch shipping rates");
    }

    const rates = await response.json();

    // Format rates for frontend
    const formattedRates = rates.result.map((rate: any) => ({
      id: rate.id,
      name: rate.name,
      rate: rate.rate,
      currency: "EUR",
      minDeliveryDays: rate.minDeliveryDays,
      maxDeliveryDays: rate.maxDeliveryDays,
    }));

    return NextResponse.json(formattedRates);
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate shipping rates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}