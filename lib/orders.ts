/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client';
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
  console.log('=== Starting Order Creation ===');
  console.log('User ID:', userId);
  console.log('Stripe Session ID:', stripeSession?.id);
  console.log('Payment Intent ID:', paymentIntent.id);
  console.log('Printful Order:', printfulOrder);
  console.log('Cart Items:', JSON.stringify(cartItems, null, 2));

  try {
    // First, verify all products exist
    const productIds = cartItems.map(item => item.id);
    console.log('Looking for products with IDs:', productIds);

    const existingProducts = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });
    console.log('Found existing products:', existingProducts.map(p => ({ id: p.id, name: p.name })));

    // Create lookup map
    const productMap = new Map(
      existingProducts.map(product => [product.id, product])
    );
    console.log('Product map created with keys:', Array.from(productMap.keys()));

    // Filter valid items
    const validCartItems = cartItems.filter(item => productMap.has(item.id));
    console.log('Valid cart items:', validCartItems.length);
    console.log('Invalid items:', cartItems.filter(item => !productMap.has(item.id)));

    if (validCartItems.length === 0) {
      console.error('No valid products found in cart');
      throw new Error('No valid products found in cart');
    }

    console.log('Preparing order data...');
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
    console.log('Order data prepared:', JSON.stringify(orderData, null, 2));

    console.log('Creating order in database...');
    const order = await prisma.order.create({
      data: orderData,
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    }).then(order => {
      console.log('Order DB created:', order);
      return order;
    }).catch(error => {
      console.error('Error creating DB order:', error);
      throw error;
    })

    console.log('=== Order Created Successfully ===');
    console.log('Order ID:', order.id);
    console.log('Total:', order.total);
    console.log('Status:', order.status);
    console.log('Items:', order.orderItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    })));
    
    return order;
  } catch (error) {
    console.error('=== Error Creating Order ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Meta:', error.meta);
    }
    
    throw error;
  }
}

export async function findOrderByStripeData(sessionId: string) {
  console.log('=== Finding Order by Stripe Data ===');
  console.log('Session ID:', sessionId);
  
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
      console.log('Order found by session ID');
      console.log('Order ID:', order.id);
      console.log('Order Status:', order.status);
      return order;
    }

    console.log('Order not found by session ID, trying payment intent...');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20'
    });
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_intent) {
      console.log('Found payment intent:', session.payment_intent);
      console.log('Waiting for webhook processing...');
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
        console.log('Order found by payment intent');
        console.log('Order ID:', order.id);
        console.log('Order Status:', order.status);
      } else {
        console.log('Order not found by payment intent');
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
  console.log('=== Ensuring Product Exists ===');
  console.log('Product Data:', {
    id: productData.id,
    name: productData.name,
    price: productData.price
  });
  
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
      }
    });

    console.log('Product upserted successfully');
    console.log('Product ID:', product.id);
    console.log('Product Name:', product.name);
    console.log('Product Price:', product.price);
    
    return product;
  } catch (error) {
    console.error('=== Error Upserting Product ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Meta:', error.meta);
    }
    
    throw error;
  }
}