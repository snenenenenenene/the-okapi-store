/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/stripe/create-checkout-session/route.ts
import { trackEvent } from "@/utils/analytics";
import { STRIPE_API_VERSION } from "@/utils/env";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    trackEvent.beginCheckout(items);

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in the cart" },
        { status: 400 }
      );
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: ["BE", "NL", "LU", "DE", "FR"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 500,
              currency: "eur",
            },
            display_name: "Shipping",
            tax_behavior: "exclusive",
            tax_code: "txcd_92010001",
          },
        },
      ],
      metadata: {
        cartItems: JSON.stringify(items),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
