import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_API_KEY!;

async function createPrintfulOrder(session: Stripe.Checkout.Session) {
  const cartItems = JSON.parse(session.metadata?.cartItems || "[]");
  const shippingDetails = session.shipping_details;

  if (!shippingDetails?.address) {
    throw new Error("No shipping address provided");
  }

  const printfulOrderData = {
    recipient: {
      name: session.shipping_details?.name,
      address1: shippingDetails.address.line1,
      address2: shippingDetails.address.line2,
      city: shippingDetails.address.city,
      state_code: shippingDetails.address.state,
      country_code: shippingDetails.address.country,
      zip: shippingDetails.address.postal_code,
      email: session.customer_details?.email,
    },
    items: cartItems.map((item: any) => ({
      sync_variant_id: parseInt(item.variant_id),
      quantity: item.quantity,
    })),
    retail_costs: {
      currency: "EUR",
      subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
      total: session.amount_total ? session.amount_total / 100 : 0,
    },
  };

  const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PRINTFUL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(printfulOrderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Printful order creation failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("Webhook event received:", event.type);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Retrieve the payment intent with expanded payment method
      const expandedPaymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntent.id,
        {
          expand: ["payment_method", "customer"],
        }
      );

      // Create Printful order
      const printfulOrder = await createPrintfulOrder(expandedPaymentIntent);

      // Create order in your database
      const order = await prisma.order.create({
        data: {
          stripePaymentId: paymentIntent.id,
          printfulId: printfulOrder.id,
          status: "processing",
          total: paymentIntent.amount / 100,
          // Add other order details as needed
        },
      });

      console.log("Order created:", order.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
