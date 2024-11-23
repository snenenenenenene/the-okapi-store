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
  paymentIntentId?: string;
}

// Track recent requests to prevent duplicates
const recentRequests = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 2000; // 2 seconds window

export async function POST(req: Request) {
  try {
    console.log("Received payment intent request");
    const body: PaymentIntentRequest = await req.json();

    // Create request fingerprint
    const requestFingerprint = JSON.stringify({
      items: body.items,
      shipping_rate: body.shipping_rate,
      paymentIntentId: body.paymentIntentId,
    });

    // Check for duplicate request
    const lastRequest = recentRequests.get(requestFingerprint);
    if (lastRequest && Date.now() - lastRequest < DUPLICATE_WINDOW_MS) {
      console.log("Duplicate request detected, skipping");
      return NextResponse.json(
        { message: "Duplicate request" },
        { status: 429 }
      );
    }

    // Update recent requests
    recentRequests.set(requestFingerprint, Date.now());

    // Clean up old requests
    const now = Date.now();
    for (const [key, timestamp] of recentRequests.entries()) {
      if (now - timestamp > DUPLICATE_WINDOW_MS) {
        recentRequests.delete(key);
      }
    }

    // Validate request body
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new Error("Invalid items array");
    }

    // Calculate totals with explicit rounding
    const itemsTotal = body.items.reduce(
      (acc: number, item: CartItem) =>
        acc + Math.round(item.price * 100) * item.quantity,
      0
    );

    const shippingTotal = body.shipping_rate
      ? Math.round(body.shipping_rate.rate * 100)
      : 0;
    const totalAmount = itemsTotal + shippingTotal;

    let paymentIntent;
    if (body.paymentIntentId) {
      // Update existing payment intent
      paymentIntent = await stripe.paymentIntents.update(body.paymentIntentId, {
        amount: totalAmount,
        currency: "eur",
      });
    } else {
      // Create new payment intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "eur",
        metadata: {
          items: JSON.stringify(body.items),
        },
      });
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error("Error updating payment intent:", error);
    return NextResponse.json({ error: "Failed to update payment intent" }, { status: 500 });
  }
}