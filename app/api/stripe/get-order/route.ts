import { NextResponse } from 'next/server'
import { OrderService } from '@/services/orderService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    const order = await OrderService.findOrderByStripeData(sessionId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ orderId: order.id });
  } catch (error: any) {
    console.error('Error retrieving order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}