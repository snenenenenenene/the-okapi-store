// /app/api/stripe/get-order/route.ts
import { OrderService } from "@/services/orderService";
import { STRIPE_API_VERSION } from "@/utils/env";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    // First, verify the payment status
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Try to find the order
    const order = await OrderService.findOrderByStripeData(sessionId);

    if (!order) {
      // Payment successful but order not found - still processing
      const retryAfterSeconds = 2;
      return NextResponse.json(
        {
          message: "Order is still processing",
          retryAfter: retryAfterSeconds,
        },
        {
          status: 202,
          headers: {
            "Retry-After": String(retryAfterSeconds),
          },
        }
      );
    }

    return NextResponse.json({ orderId: order.id });
  } catch (error: any) {
    console.error("Error retrieving order:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve order",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
