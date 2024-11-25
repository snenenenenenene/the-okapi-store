// /app/api/stripe/get-order/route.ts

import { NextResponse } from "next/server";
import { OrderService } from "@/services/orderService";
import { Stripe } from "stripe";
import { STRIPE_API_VERSION } from "@/utils/env";

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
      // Payment successful but order not found - might still be processing
      // Wait briefly and try one more time
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const retryOrder = await OrderService.findOrderByStripeData(sessionId);

      if (!retryOrder) {
        return NextResponse.json(
          {
            error: "Order not found",
            message: "Payment successful, but order is still processing",
          },
          { status: 202 }
        );
      }

      return NextResponse.json({ orderId: retryOrder.id });
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