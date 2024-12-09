/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Stripe } from "stripe";

interface CreateOrderParams {
  userId: string;
  stripeSession: Stripe.Checkout.Session;
  paymentIntent: Stripe.PaymentIntent;
  printfulOrder: any;
  cartItems: any[];
  total: number;
}

export class OrderService {
  static async createOrder({
    userId,
    stripeSession,
    paymentIntent,
    printfulOrder,
    cartItems,
    total,
  }: CreateOrderParams) {
    if (!cartItems?.length) {
      throw new Error("No valid items in cart");
    }

    return await prisma.order.create({
      data: {
        userId,
        status: "processing",
        total,
        stripeSessionId: stripeSession?.id,
        stripePaymentId: paymentIntent.id,
        printfulId: printfulOrder?.id,
        printfulStatus: printfulOrder?.status,
        trackingNumber: printfulOrder?.tracking_number,
        trackingUrl: printfulOrder?.tracking_url,
        orderItems: {
          // @ts-ignore
          create: cartItems.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            product: {
              connectOrCreate: {
                where: { id: item.id },
                create: {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  inStock: true,
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
  }
}
