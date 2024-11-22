/* eslint-disable @typescript-eslint/no-explicit-any */

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

interface CartItem {
  variant_id: string | number;
  quantity: number;
}

export async function createPrintfulOrder({
  recipient,
  items,
  retail_costs,
}: {
  recipient: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state_code: string;
    country_code: string;
    zip: string;
  };
  items: Array<{
    sync_variant_id: string | number;
    quantity: number;
  }>;
  retail_costs: {
    subtotal: number;
    total: number;
    shipping: number;
  };
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PRINTFUL_API_URL}/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient,
        items,
        retail_costs,
        confirm: true, // Auto-confirm the order
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Printful order creation failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export async function getShippingRates(address: any, items: any[]) {
  try {
    const response = await fetch("/api/printful/shipping-rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        items,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch shipping rates");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    throw error;
  }
}
