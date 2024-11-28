// app/api/stripe/webhook/route.ts
import prisma from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/utils/emailService";
import { createPrintfulOrder } from "@/utils/printful";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    console.log("Webhook received");
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("No signature found");
      return NextResponse.json(
        { error: "No signature found" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log(`Event constructed successfully. Type: ${event.type}`);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    if (event.type === "charge.succeeded") {
      console.log("Processing charge.succeeded event");
      const charge = event.data.object as Stripe.Charge;

      // Get payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(
        charge.payment_intent as string
      );

      // Parse cart items
      let cartItems;
      try {
        cartItems = charge.metadata?.items
          ? JSON.parse(charge.metadata.items)
          : [];
        console.log("Cart items:", cartItems);

        cartItems = cartItems.map((item: any) => ({
          ...item,
          id: String(item.id),
          variant_id: String(item.variant_id),
        }));
      } catch (error) {
        console.error("Error parsing cart items:", error);
        throw new Error("Invalid cart items format");
      }

      // Create or get user
      const customerEmail = charge.billing_details.email;
      if (!customerEmail) {
        throw new Error("No customer email found in charge");
      }

      const user = await prisma.user.upsert({
        where: { email: customerEmail },
        update: {},
        create: {
          email: customerEmail,
          name: charge.billing_details.name || "Customer",
          role: "user",
          credits: 0,
        },
      });

      // Create Printful order
      console.log("Creating Printful order...");
      const printfulOrder = await createPrintfulOrder(
        charge,
        paymentIntent,
        null
      );
      console.log("Printful order created:", printfulOrder);

      // Check for existing order
      const existingOrder = await prisma.order.findFirst({
        where: {
          stripePaymentId: paymentIntent.id,
        },
      });

      if (existingOrder) {
        console.log("Order already exists:", existingOrder);
        return NextResponse.json({ received: true });
      }

      // Create new order
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status: "processing",
          total: charge.amount / 100,
          stripePaymentId: paymentIntent.id,
          printfulId: printfulOrder?.id ? String(printfulOrder.id) : undefined,
          orderItems: {
            create: cartItems.map((item: any) => ({
              quantity: item.quantity,
              price: parseFloat(String(item.price)),
              product: {
                connectOrCreate: {
                  where: {
                    id: String(item.id),
                  },
                  create: {
                    id: String(item.id),
                    name: item.name,
                    description: item.name, // Using name as description or provide a default description
                    price: parseFloat(String(item.price)),
                    image: item.image,
                  },
                },
              },
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      console.log("Order created successfully:", order.id);

      // Send confirmation email
      if (customerEmail) {
        await sendOrderConfirmationEmail(
          customerEmail,
          order.id,
          order.orderItems,
          order.total,
          printfulOrder
        );
      }

      return NextResponse.json({
        received: true,
        orderId: order.id,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
