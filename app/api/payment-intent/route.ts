import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Create a Map to store recent requests
const recentRequests = new Map();
const DUPLICATE_WINDOW = 2000; // 2 seconds

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Create a request fingerprint
    const requestFingerprint = JSON.stringify(body);

    // Check for duplicate request
    const lastRequestTime = recentRequests.get(requestFingerprint);
    if (lastRequestTime && Date.now() - lastRequestTime < DUPLICATE_WINDOW) {
      return NextResponse.json(
        { error: "Duplicate request detected" },
        { status: 429 }
      );
    }

    // Store the request timestamp
    recentRequests.set(requestFingerprint, Date.now());

    // Clean up old requests
    const now = Date.now();
    for (const [key, timestamp] of recentRequests.entries()) {
      if (now - timestamp > DUPLICATE_WINDOW) {
        recentRequests.delete(key);
      }
    }

    const { items, shipping_rate, paymentIntentId } = body;

    // Calculate the amount in cents
    const subtotal = items.reduce(
      (sum: number, item: any) =>
        sum + Math.round(item.price * 100) * item.quantity,
      0
    );

    // Add shipping if provided
    const shippingAmount = shipping_rate
      ? Math.round(shipping_rate.rate * 100)
      : 0;
    const totalAmount = subtotal + shippingAmount;

    let paymentIntent;

    if (paymentIntentId) {
      // Update existing payment intent
      paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount: totalAmount,
      });
    } else {
      // Create new payment intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          items: JSON.stringify(items),
        },
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: "Error creating payment intent" },
      { status: 500 }
    );
  }
}
