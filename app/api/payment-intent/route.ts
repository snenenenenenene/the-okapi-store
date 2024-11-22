// app/api/payment-intent/route.ts
import { STRIPE_API_VERSION } from "@/utils/env";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

export async function POST(req: Request) {
  try {
    const { items, payment_intent_id } = await req.json();

    // Calculate total amount
    const orderAmount = items.reduce(
      (acc: number, item: any) =>
        acc + Math.round(item.price * 100) * item.quantity,
      0
    );

    let intent;

    // If there's a saved payment intent ID, update it. Otherwise, create new one
    if (payment_intent_id) {
      intent = await stripe.paymentIntents.update(payment_intent_id, {
        amount: orderAmount,
      });
    } else {
      // Create new payment intent
      intent = await stripe.paymentIntents.create({
        amount: orderAmount,
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          items: JSON.stringify(
            items.map((item) => ({
              id: item.id,
              variant_id: item.variant_id,
              quantity: item.quantity,
            }))
          ),
        },
      });
    }

    return NextResponse.json({
      clientSecret: intent.client_secret,
      payment_intent_id: intent.id,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
