import { STRIPE_API_VERSION } from "@/utils/env";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant_id: string;
}

interface PaymentIntentRequest {
  items: CartItem[];
  payment_intent_id?: string | null;
  shipping_rate?: {
    id: string;
    rate: number;
  };
  amount?: number;
  shipping_address?: any;
}

export async function POST(req: Request) {
  try {
    const body: PaymentIntentRequest = await req.json();

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const orderAmount = Math.round(
      body.items.reduce(
        (acc: number, item: CartItem) => acc + item.price * 100 * item.quantity,
        0
      )
    );

    const finalAmount = body.shipping_rate
      ? orderAmount + Math.round(body.shipping_rate.rate * 100)
      : orderAmount;

    let intent;

    const shippingData = body.shipping_address
      ? {
          shipping: {
            address: {
              line1: body.shipping_address.address.line1,
              line2: body.shipping_address.address.line2 || "",
              city: body.shipping_address.address.city,
              state: body.shipping_address.address.state,
              postal_code: body.shipping_address.address.postal_code,
              country: body.shipping_address.address.country,
            },
            name: body.shipping_address.name,
            phone: body.shipping_address.phone,
          },
        }
      : {};

    if (body.payment_intent_id && body.payment_intent_id !== "undefined") {
      try {
        // First try to retrieve the payment intent
        const existingIntent = await stripe.paymentIntents.retrieve(
          body.payment_intent_id
        );

        if (existingIntent) {
          intent = await stripe.paymentIntents.update(body.payment_intent_id, {
            amount: finalAmount,
            ...shippingData,
          });
        }
      } catch (error) {
        // If retrieval fails, we'll create a new one below
        console.log("Failed to retrieve payment intent, creating new one");
      }
    }

    // If no existing intent or retrieval failed, create a new one
    if (!intent) {
      intent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency: "eur",
        automatic_payment_methods: { enabled: true },
        metadata: {
          items: JSON.stringify(
            body.items.map((item) => ({
              id: item.id,
              variant_id: item.variant_id,
              quantity: item.quantity,
            }))
          ),
        },
        ...shippingData,
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
