// app/api/stripe/create-checkout-session/route.ts
import { STRIPE_API_VERSION } from "@/utils/env";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

// Most countries where Printful ships
const SUPPORTED_COUNTRIES = [
  // North America
  "US",
  "CA",
  "MX",
  // Europe
  "GB",
  "FR",
  "DE",
  "IT",
  "ES",
  "NL",
  "BE",
  "IE",
  "AT",
  "DK",
  "FI",
  "NO",
  "SE",
  "CH",
  "PT",
  "PL",
  "CZ",
  "SK",
  "HU",
  "RO",
  "BG",
  "HR",
  "EE",
  "LT",
  "LV",
  "SI",
  "GR",
  "LU",
  "MT",
  "IS",
  // Asia Pacific
  "JP",
  "KR",
  "SG",
  "AU",
  "NZ",
  "HK",
  "MY",
  "TW",
  // Other regions
  "IL",
  "AE",
  "SA",
  "BR",
  "ZA",
  "TR",
];

// Default shipping rates for initial checkout creation
const DEFAULT_SHIPPING_RATES = [
  {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 500, currency: "eur" },
      display_name: "Standard Shipping",
      delivery_estimate: {
        minimum: { unit: "business_day", value: 5 },
        maximum: { unit: "business_day", value: 10 },
      },
    },
  },
];

async function getPrintfulShippingRates(address: any, items: any[]) {
  try {
    const printfulItems = items.map((item) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
    }));

    const response = await fetch(`${PRINTFUL_API_URL}/shipping/rates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PRINTFUL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: {
          address1: address.address1,
          city: address.city,
          country_code: address.country,
          state_code: address.state,
          zip: address.zip,
        },
        items: printfulItems,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Printful shipping rates");
    }

    const data = await response.json();

    // Convert Printful rates to Stripe shipping rate format
    return data.result.map((rate: any) => ({
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: Math.round(rate.rate * 100),
          currency: "eur",
        },
        display_name: rate.name,
        delivery_estimate: {
          minimum: { unit: "business_day", value: rate.min_delivery_days || 3 },
          maximum: {
            unit: "business_day",
            value: rate.max_delivery_days || 10,
          },
        },
      },
    }));
  } catch (error) {
    console.error("Error fetching Printful shipping rates:", error);
    // Return default rates if Printful calculation fails
    return DEFAULT_SHIPPING_RATES;
  }
}

export async function POST(req: Request) {
  try {
    const { items, shippingAddress } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Get shipping rates from Printful if address is provided
    let shippingRates = DEFAULT_SHIPPING_RATES;
    if (shippingAddress) {
      shippingRates = await getPrintfulShippingRates(shippingAddress, items);
    }

    // Create Stripe session with calculated shipping rates
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            images: [item.image],
            metadata: {
              variant_id: item.variant_id,
            },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: {
        allowed_countries: SUPPORTED_COUNTRIES,
      },
      mode: "payment",
      metadata: {
        cartItems: JSON.stringify(items),
      },
      shipping_options: shippingRates,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
