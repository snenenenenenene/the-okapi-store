/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Stripe } from 'stripe'

export async function createOrder({
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
  
  
  
  
  
  

  try {
    // First, verify all products exist
    const productIds = cartItems.map(item => item.id);
    

    const existingProducts = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });
    

    // Create lookup map
    const productMap = new Map(
      existingProducts.map(product => [product.id, product])
    );
    

    // Filter valid items
    const validCartItems = cartItems.filter(item => productMap.has(item.id));
    
    

    if (validCartItems.length === 0) {
      console.error('No valid products found in cart');
      throw new Error('No valid products found in cart');
    }

    
    const orderData = {
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
    };
    

    
    const order = await prisma.order.create({
      data: orderData as any,
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      } 
    }).then(order => {
      
      return order;
    }).catch(error => {
      console.error('Error creating DB order:', error);
      throw error;
    })
   
    return order;
  } catch (error) {
    console.error('=== Error Creating Order ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Meta:', error.meta);
    }
    
    throw error;
  }
}

export async function findOrderByStripeData(sessionId: string) {
  
  
  
  try {
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

    if (order) {
      
      
      
      return order;
    }

    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20'
    });
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_intent) {
      
      
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

      if (order) {
        
        
        
      } else {
        
      }
    }

    return order;
  } catch (error) {
    console.error('=== Error Finding Order ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}

export async function ensureProductExists(productData: {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}) {
  
  
  try {
    const product = await prisma.product.upsert({
      where: { id: productData.id },
      update: {},
      create: {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image,
        inStock: 1
      } as any
    });

    
    
    
    
    
    return product;
  } catch (error) {
    console.error('=== Error Upserting Product ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Meta:', error.meta);
    }
    
    throw error;
  }
}