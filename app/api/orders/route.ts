// app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/options'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Fetching orders for user email:', session.user.email);

    // First, find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json({ orders: [] });
    }

    console.log('Found user ID:', user.id);

    // Get all orders where the user is either the owner or has an association
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          {
            associations: {
              some: {
                userId: user.id
              }
            }
          }
        ]
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        associations: {
          include: {
            user: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${orders.length} orders for user ${user.id}`);
    
    if (orders.length > 0) {
      console.log('Sample order IDs:', orders.map(o => o.id));
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { cart, shippingAddress, shippingRate, paymentIntentId, email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find or create user as guest
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        role: 'user',
      }
    });

    // Calculate total (includes shipping)
    const subtotal = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const shipping = shippingRate ? Number(shippingRate.rate) : 0;
    const total = subtotal + shipping;

    // Create the order in our database
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'pending',
        total: total,
        stripePaymentId: paymentIntentId,
        orderItems: {
          create: cart.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    // Return immediately without creating Printful order
    return NextResponse.json({ 
      orderId: order.id
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}