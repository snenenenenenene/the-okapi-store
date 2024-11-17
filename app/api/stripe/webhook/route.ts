/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { trackEvent } from "@/utils/analytics";
import { sendOrderConfirmationEmail } from "@/utils/emailService";
import { createPrintfulOrder } from "@/utils/printful";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { authOptions } from "../../auth/[...nextauth]/options";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  console.log("Webhook received");

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("No signature found");
    return NextResponse.json({ error: "No signature found" }, { status: 400 });
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

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "charge.succeeded"
    ) {
      console.log("Processing event:", event.type);

      let charge: Stripe.Charge;
      let session: Stripe.Checkout.Session | null = null;

      if (event.type === "charge.succeeded") {
        // Add this after successful purchase
        charge = event.data.object as Stripe.Charge;
      } else {
        // For checkout.session.completed, get the charge from the payment intent
        session = event.data.object as Stripe.Checkout.Session;
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string
        );
        const charges = await stripe.charges.list({
          payment_intent: paymentIntent.id,
        });
        charge = charges.data[0];
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(
        charge.payment_intent as string
      );

      if (!session) {
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });
        session = sessions.data[0];
      }

      // Get both the customer email and the logged-in user's email
      const customerEmail =
        charge.billing_details.email || session?.customer_details?.email;
      const serverSession = await getServerSession(authOptions);
      const loggedInEmail = serverSession?.user?.email;

      console.log("Customer Email:", customerEmail);
      console.log("Logged In Email:", loggedInEmail);

      // Create Printful order
      const printfulOrder = await createPrintfulOrder(
        charge,
        paymentIntent,
        session
      );

      // Ensure both users exist in our system
      const [customerUser, loggedInUser] = await Promise.all([
        // Create or get customer user
        prisma.user.upsert({
          where: { email: customerEmail || `guest_${Date.now()}@example.com` },
          update: {},
          create: {
            email: customerEmail || `guest_${Date.now()}@example.com`,
            name:
              charge.billing_details.name ||
              session?.customer_details?.name ||
              "Customer",
            role: "user",
            credits: 0,
          },
        }),
        // Create or get logged-in user if different from customer
        loggedInEmail && loggedInEmail !== customerEmail
          ? prisma.user.upsert({
              where: { email: loggedInEmail },
              update: {},
              create: {
                email: loggedInEmail,
                name: serverSession?.user?.name || "User",
                role: "user",
                credits: 0,
              },
            })
          : null,
      ]);

      console.log("Customer User:", customerUser?.id);
      console.log("Logged In User:", loggedInUser?.id);

      // Ensure products exist in database
      const cartItems = JSON.parse(
        session?.metadata?.cartItems || paymentIntent.metadata.cartItems
      );
      await Promise.all(
        cartItems.map(async (item: any) => {
          await prisma.product.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              name: item.name,
              description: item.name,
              price: parseFloat(item.price),
              image: item.image,
              inStock: 1,
            },
          });
        })
      );

      // Check if order already exists
      const existingOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { stripeSessionId: session?.id },
            { stripePaymentId: paymentIntent.id },
          ],
        },
      });

      if (existingOrder) {
        console.log("Order already exists:", existingOrder.id);
        return NextResponse.json({
          received: true,
          orderId: existingOrder.id,
          printfulOrder,
        });
      }

      // Create the order
      const order = await prisma.order.create({
        data: {
          userId: customerUser.id, // Primary owner is the customer
          status: "processing",
          total: charge.amount / 100,
          stripeSessionId: session?.id,
          stripePaymentId: paymentIntent.id,
          printfulId: printfulOrder?.id,
          orderItems: {
            create: cartItems.map((item: any) => ({
              quantity: item.quantity,
              price: parseFloat(item.price),
              product: {
                connect: { id: item.id },
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

      // Create order associations
      await prisma.orderAssociation.create({
        data: {
          orderId: order.id,
          userId: customerUser.id,
          type: "CUSTOMER",
        },
      });

      // Add logged-in user association if different from customer
      if (loggedInUser && loggedInUser.id !== customerUser.id) {
        await prisma.orderAssociation.create({
          data: {
            orderId: order.id,
            userId: loggedInUser.id,
            type: "CREATOR",
          },
        });
      }

      // Send confirmation emails to both users
      const emailPromises: Promise<void>[] = [];

      if (customerEmail) {
        emailPromises.push(
          sendOrderConfirmationEmail(
            customerEmail,
            order.id,
            order.orderItems,
            order.total,
            printfulOrder
          )
        );
      }

      if (loggedInEmail && loggedInEmail !== customerEmail) {
        emailPromises.push(
          sendOrderConfirmationEmail(
            loggedInEmail,
            order.id,
            order.orderItems,
            order.total,
            printfulOrder
          )
        );
      }

      await Promise.all(emailPromises);

      console.log("Order process completed successfully");
      trackEvent.purchase(order.id, printfulOrder, order.total);

      return NextResponse.json({
        received: true,
        orderId: order.id,
        printfulOrder,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
