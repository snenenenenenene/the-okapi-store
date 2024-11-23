import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant_id: string;
}

interface PaymentIntentRequest {
  items: CartItem[];
  shipping_rate?: {
    id: string;
    rate: number;
  };
}

export async function POST(req: Request) {
  try {
    const body: PaymentIntentRequest = await req.json();

    // Validate request body
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!body.shipping_rate) {
      return NextResponse.json(
        { error: "Shipping rate is required" },
        { status: 400 }
      );
    }

    // Calculate totals with explicit rounding
    const itemsTotal = body.items.reduce(
      (acc: number, item: CartItem) =>
        acc + Math.round(item.price * 100) * item.quantity,
      0
    );

    const shippingCost = Math.round(body.shipping_rate.rate * 100);
    const finalAmount = itemsTotal + shippingCost;

    // Add idempotency key to prevent duplicate charges
    const idempotencyKey = crypto.randomUUID();

    const paymentIntent = await stripe.paymentIntents.create(
      {
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
          shipping_rate: JSON.stringify(body.shipping_rate),
          subtotal: itemsTotal.toString(),
          shipping_cost: shippingCost.toString(),
          total: finalAmount.toString(),
        },
      },
      {
        idempotencyKey,
      }
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create payment intent",
      },
      { status: 400 }
    );
  }
}
