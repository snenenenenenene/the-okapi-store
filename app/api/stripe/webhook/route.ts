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
      
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    if (event.type === "charge.succeeded") {
      
      const charge = event.data.object as Stripe.Charge;
      
      
        raw: charge.metadata,
        itemsType: typeof charge.metadata?.items,
        itemsLength: charge.metadata?.items?.length
      });

      // Get payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(
        charge.payment_intent as string
      );
      
      
        raw: paymentIntent.metadata,
        itemsType: typeof paymentIntent.metadata?.items,
        itemsLength: paymentIntent.metadata?.items?.length
      });

      // Parse cart items
      let cartItems;
      try {
        const itemsJson = charge.metadata?.items || paymentIntent.metadata?.items;
        
        
        if (!itemsJson) {
          console.error("No items found in metadata");
          throw new Error("No items found in metadata");
        }

        // Parse the JSON string - it's already a valid JSON string, no need for cleaning
        cartItems = JSON.parse(itemsJson);
        

        // Validate cart items structure
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
          throw new Error("Invalid cart items format or empty cart");
        }

        // Process cart items - ensure all fields are present
        cartItems = cartItems.map((item: any) => {
          if (!item.id || !item.variant_id || !item.name || !item.price || !item.quantity) {
            console.error("Invalid item format:", item);
            throw new Error(`Invalid item format for item: ${JSON.stringify(item)}`);
          }
          return {
            id: String(item.id),
            variant_id: String(item.variant_id),
            name: item.name,
            price: parseFloat(String(item.price)),
            quantity: parseInt(String(item.quantity)),
            size: item.size || null,
            image: item.image || null,
          };
        });
        
        
      } catch (error: any) {
        console.error("\n=== Cart Items Processing Error ===");
        console.error("Error details:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        throw error;
      }

      // Calculate prices as shown in checkout
      const subtotal = cartItems.reduce(
        (sum: number, item: any) => sum + (item.price * item.quantity),
        0
      );

      const shippingCost = 4.29; // Flat rate shipping
      const vatRate = 0.23; // 23% VAT rate
      const vatAmount = (subtotal + shippingCost) * vatRate;
      const total = subtotal + shippingCost + vatAmount;

      // Convert to cents for Stripe comparison (same as in payment-intent)
      const expectedAmount = Math.round(total * 100);

      // Verify the payment amount matches what we expect
      if (charge.amount !== expectedAmount) {
        console.error("Payment amount mismatch", {
          expected: expectedAmount,
          received: charge.amount,
          difference: charge.amount - expectedAmount,
          breakdown: {
            subtotal: Math.round(subtotal * 100),
            shipping: Math.round(shippingCost * 100),
            vat: Math.round(vatAmount * 100),
          }
        });
      }

      // Create or get user (just store the email, no need for full user account)
      const customerEmail = charge.billing_details.email;
      if (!customerEmail) {
        throw new Error("No customer email found in charge");
      }

      let user = await prisma.user.findUnique({
        where: { email: customerEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: customerEmail,
            name: charge.billing_details.name || "Guest",
            role: "user",
          },
        });
      }

      // Create new order with all price details
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status: "pending",
          subtotal: subtotal,
          shippingCost: shippingCost,
          vatAmount: vatAmount,
          total: total,
          stripePaymentId: paymentIntent.id,
          shippingName: "Flat Rate (Estimated delivery: 5-7 business days)",
          orderItems: {
            create: cartItems.map((item: any) => ({
              quantity: item.quantity,
              price: parseFloat(String(item.price)), // This is our selling price
              name: item.name,
              size: item.size,
              product: {
                connectOrCreate: {
                  where: {
                    id: String(item.id)
                  },
                  create: {
                    id: String(item.id),
                    name: item.name,
                    description: "",
                    price: parseFloat(String(item.price)), // Store our selling price
                    image: item.image || "",
                  }
                }
              }
            }))
          },
        },
        include: {
          orderItems: true,
          user: true,
        },
      });

      // Create Printful order
      
      const printfulOrder = await createPrintfulOrder(
        charge,
        paymentIntent,
        order as any
      );

      if (printfulOrder?.id) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            printfulId: String(printfulOrder.id),
            status: "processing",
          },
        });
      }

      // Send confirmation email with the stored prices
      await sendOrderConfirmationEmail(order);

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