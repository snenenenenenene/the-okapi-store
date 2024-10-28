import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createPrintfulOrder } from '@/utils/printful'
import { sendOrderConfirmationEmail } from '@/utils/emailService'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/options'

import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
});

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string);
      
      let session = null;
      if (!paymentIntent.metadata.cartItems) {
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });
        session = sessions.data[0];
      }

      // Create Printful order
      const printfulOrder = await createPrintfulOrder(charge, paymentIntent, session);

      // Try to get current logged in user first
      const serverSession = await getServerSession(authOptions);
      let user = null;

      if (serverSession?.user?.email) {
        user = await prisma.user.findUnique({
          where: { email: serverSession.user.email }
        });
      }

      // If no logged in user, try to find or create by email from the charge
      if (!user) {
        const email = charge.billing_details.email || session?.customer_details?.email;
        if (email) {
          user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: email,
                name: charge.billing_details.name || session?.customer_details?.name || 'Guest User',
              }
            });
          }
        } else {
          // Create guest user if no email available
          user = await prisma.user.create({
            data: {
              email: `guest_${Date.now()}@example.com`,
              name: 'Guest User',
            }
          });
        }
      }

      // Parse cart items
      const cartItems = JSON.parse(session?.metadata?.cartItems || paymentIntent.metadata.cartItems);
      
      // Ensure all products exist
      await Promise.all(
        cartItems.map((item: any) =>
          prisma.product.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              name: item.name,
              description: item.name,
              price: item.price,
              image: item.image,
              inStock: 1
            }
          })
        )
      );

      // Create the order
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status: 'processing',
          total: charge.amount / 100,
          stripeSessionId: session?.id,
          stripePaymentId: paymentIntent.id,
          printfulId: printfulOrder?.id,
          orderItems: {
            create: cartItems.map((item: any) => ({
              quantity: item.quantity,
              price: item.price,
              product: {
                connect: {
                  id: item.id
                }
              }
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });

      // Send confirmation email
      const email = charge.billing_details.email || session?.customer_details?.email;
      if (email) {
        await sendOrderConfirmationEmail(
          email,
          order.id,
          order.orderItems,
          order.total,
          printfulOrder
        );
      }

      return NextResponse.json({ 
        received: true, 
        orderId: order.id,
        printfulOrder 
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ 
      error: 'Failed to process webhook', 
      details: error.message 
    }, { status: 500 });
  }
}