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
    console.log("=== Webhook Processing Started ===");
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
      console.log("Event type:", event.type);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    if (event.type === "charge.succeeded") {
      console.log("\n=== Processing Charge Succeeded Event ===");
      const charge = event.data.object as Stripe.Charge;
      
      console.log("\nCharge Metadata:", {
        raw: charge.metadata,
        itemsType: typeof charge.metadata?.items,
        itemsLength: charge.metadata?.items?.length
      });

      // Get payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(
        charge.payment_intent as string
      );
      
      console.log("\nPayment Intent Metadata:", {
        raw: paymentIntent.metadata,
        itemsType: typeof paymentIntent.metadata?.items,
        itemsLength: paymentIntent.metadata?.items?.length
      });

      // Parse cart items
      let cartItems;
      try {
        const itemsJson = charge.metadata?.items || paymentIntent.metadata?.items;
        console.log("\nRaw items JSON:", itemsJson);
        
        if (!itemsJson) {
          console.error("No items found in metadata");
          throw new Error("No items found in metadata");
        }

        // Try parsing the JSON string
        try {
          console.log("\nAttempting first JSON parse...");
          cartItems = JSON.parse(itemsJson);
          console.log("First parse result:", cartItems);
        } catch (parseError) {
          console.error("First parse failed:", parseError);
          
          // If first parse fails, try cleaning the string
          console.log("\nAttempting to clean and parse JSON...");
          const cleanJson = itemsJson.replace(/\\"/g, '"').replace(/^"/, '').replace(/"$/, '');
          console.log("Cleaned JSON string:", cleanJson);
          
          cartItems = JSON.parse(cleanJson);
          console.log("Second parse result:", cartItems);
        }

        // Validate cart items structure
        console.log("\nValidating cart items:", {
          isArray: Array.isArray(cartItems),
          length: cartItems?.length,
          firstItem: cartItems?.[0]
        });

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
          throw new Error("Invalid cart items format or empty cart");
        }

        // Process cart items
        cartItems = cartItems.map((item: any) => ({
          ...item,
          id: String(item.id),
          variant_id: String(item.variant_id),
        }));
        
        console.log("\nProcessed cart items:", cartItems);

      } catch (error) {
        console.error("\n=== Cart Items Processing Error ===");
        console.error("Error details:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        throw new Error("No items found in the cart or invalid cart format");
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

      // Check for existing order
      const existingOrder = await prisma.order.findFirst({
        where: {
          stripePaymentId: paymentIntent.id,
        },
      });

      if (existingOrder) {
        console.log("Order already exists:", existingOrder);
        
        // If order exists but no Printful ID, create Printful order
        if (!existingOrder.printfulId && existingOrder.status === 'pending') {
          console.log("Creating Printful order for existing order...");
          const printfulOrder = await createPrintfulOrder(
            charge,
            paymentIntent,
            existingOrder
          );
          
          // Update order with Printful ID and status
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              printfulId: printfulOrder?.id ? String(printfulOrder.id) : undefined,
              status: printfulOrder?.id ? 'processing' : 'failed'
            }
          });
        }
        
        return NextResponse.json({ received: true });
      }

      // Create new order only if it doesn't exist
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status: "pending",
          total: charge.amount / 100,
          stripePaymentId: paymentIntent.id,
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
                    description: item.name,
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

      // Create Printful order
      console.log("Creating Printful order for new order...");
      const printfulOrder = await createPrintfulOrder(
        charge,
        paymentIntent,
        order
      );

      // Update order with Printful ID and status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          printfulId: printfulOrder?.id ? String(printfulOrder.id) : undefined,
          status: printfulOrder?.id ? 'processing' : 'failed'
        }
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
    console.error("\n=== Webhook Processing Error ===");
    console.error("Error details:", error);
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