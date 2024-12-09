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

    // Add shipping (fixed at 4.29)
    const shippingAmount = 429; // €4.29 in cents

    // Calculate VAT (23%) on subtotal + shipping
    const vatAmount = Math.round((subtotal + shippingAmount) * 0.23);
    
    // Calculate total including VAT
    const totalAmount = subtotal + shippingAmount + vatAmount;

    let paymentIntent;

    if (paymentIntentId) {
      // Update existing payment intent
      paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount: totalAmount,
        metadata: {
          subtotal: subtotal,
          shipping: shippingAmount,
          vat: vatAmount,
          items: JSON.stringify(items),
        },
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
          subtotal: subtotal,
          shipping: shippingAmount,
          vat: vatAmount,
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
