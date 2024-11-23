import prisma from "@/lib/prisma";
import { createPrintfulOrder } from "@/utils/printful";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Processing payment success:", paymentIntent.id);

      try {
        // Parse cart items from metadata
        const cartItems = paymentIntent.metadata.items
          ? JSON.parse(paymentIntent.metadata.items)
          : [];

        // Get shipping details
        const shipping = paymentIntent.shipping;
        if (!shipping) {
          throw new Error("No shipping information found");
        }

        // Create Printful order
        const printfulOrder = await createPrintfulOrder({
          recipient: {
            name: shipping.name,
            address1: shipping.address.line1,
            address2: shipping.address.line2 || "",
            city: shipping.address.city,
            state_code: shipping.address.state || "",
            country_code: shipping.address.country,
            zip: shipping.address.postal_code,
          },
          items: cartItems.map((item: any) => ({
            sync_variant_id: item.variant_id,
            quantity: item.quantity,
          })),
          retail_costs: {
            subtotal: paymentIntent.amount / 100,
            total: paymentIntent.amount / 100,
            shipping: 0, // Include actual shipping cost if available
          },
        });

        console.log("Created Printful order:", printfulOrder);

        // Create order in database
        const order = await prisma.order.create({
          data: {
            userId: paymentIntent.metadata.userId || "anonymous",
            status: "processing",
            total: paymentIntent.amount / 100,
            stripePaymentId: paymentIntent.id,
            printfulId: printfulOrder.id,
            printfulStatus: printfulOrder.status,
            orderItems: {
              create: cartItems.map((item: any) => ({
                quantity: item.quantity,
                price: item.price,
                product: {
                  connect: { id: item.id },
                },
              })),
            },
            shipping: {
              create: {
                name: shipping.name,
                address1: shipping.address.line1,
                address2: shipping.address.line2 || "",
                city: shipping.address.city,
                state: shipping.address.state || "",
                country: shipping.address.country,
                postalCode: shipping.address.postal_code,
                phone: shipping.phone,
              },
            },
          },
          include: {
            orderItems: true,
            shipping: true,
          },
        });

        console.log("Created order in database:", order.id);

        // Update Stripe payment intent with order references
        await stripe.paymentIntents.update(paymentIntent.id, {
          metadata: {
            ...paymentIntent.metadata,
            order_id: order.id,
            printful_order_id: printfulOrder.id,
          },
        });
      } catch (error) {
        console.error("Error processing successful payment:", error);
        // Still return 200 to acknowledge receipt
        return NextResponse.json({
          received: true,
          error: "Error processing order but webhook received",
        });
      }
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