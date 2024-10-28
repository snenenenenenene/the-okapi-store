import prisma from '@/lib/prisma'
import { Stripe } from 'stripe'

export class OrderService {
  static async createOrder({
    userId,
    stripeSession,
    paymentIntent,
    printfulOrder,
    cartItems,
  }: {
    userId: string;
    stripeSession: Stripe.Checkout.Session | null;
    paymentIntent: Stripe.PaymentIntent;
    printfulOrder: any;
    cartItems: any[];
  }) {
    // First, verify all products exist and get their details
    const productIds = cartItems.map(item => item.id);
    const existingProducts = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    // Create map of existing products for easy lookup
    const productMap = new Map(
      existingProducts.map(product => [product.id, product])
    );

    // Filter out any items where product doesn't exist
    const validCartItems = cartItems.filter(item => productMap.has(item.id));

    if (validCartItems.length === 0) {
      throw new Error('No valid products found in cart');
    }

    // Create the order with only valid items
    return prisma.order.create({
      data: {
        userId,
        status: 'processing',
        total: paymentIntent.amount / 100,
        stripeSessionId: stripeSession?.id,
        stripePaymentId: paymentIntent.id,
        printfulId: printfulOrder?.id,
        orderItems: {
          create: validCartItems.map(item => ({
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
    }).then(order => {
      console.log('Order DB created:', order);
    }).catch(error => {
      console.error('Error creating DB order:', error);
      throw error;
    })
  }

  static async findOrderByStripeData(sessionId: string) {
    // First try session ID
    let order = await prisma.order.findFirst({
      where: { 
        stripeSessionId: sessionId 
      },
      include: {
        orderItems: {
          include: { 
            product: true 
          }
        }
      }
    });

    if (!order) {
      // If not found, try payment intent
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-06-20'
      });
      
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_intent) {
          // Wait a bit for webhook processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          order = await prisma.order.findFirst({
            where: { 
              stripePaymentId: session.payment_intent as string 
            },
            include: {
              orderItems: {
                include: { 
                  product: true 
                }
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching Stripe session:', error);
      }
    }

    return order;
  }

  static async createProductIfNotExists(productData: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
  }) {
    return prisma.product.upsert({
      where: { id: productData.id },
      update: {},
      create: {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image,
        inStock: 1
      }
    });
  }
}