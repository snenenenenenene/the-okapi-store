import { STRIPE_API_VERSION } from "@/utils/env";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { authOptions } from "../../auth/[...nextauth]/options";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { items } = await req.json();

    console.log("Creating checkout session with items:", JSON.stringify(items, null, 2));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '');
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_BASE_URL is not configured');
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          images: [item.image],
          metadata: {
            variant_id: item.variant_id.toString(),
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "pay",
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["BE", "NL", "LU", "DE", "FR"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 500, // €5.00
              currency: "eur",
            },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 3,
              },
              maximum: {
                unit: "business_day",
                value: 5,
              },
            },
          },
        },
      ],
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: {
        cartItems: JSON.stringify(items),
        userId: session?.user?.id || "guest",
      },
      payment_intent_data: {
        metadata: {
          cartItems: JSON.stringify(items),
          userId: session?.user?.id || "guest",
        },
      },
      customer_email: session?.user?.email,
    });

    console.log("Checkout session created:", {
      id: checkoutSession.id,
      successUrl: checkoutSession.success_url,
      cancelUrl: checkoutSession.cancel_url
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}