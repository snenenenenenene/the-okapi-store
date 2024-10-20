/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/printful/create-order/route.ts
import { STRIPE_API_VERSION } from '@/utils/env'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const PRINTFUL_API_URL = 'https://api.printful.com'
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: STRIPE_API_VERSION })

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer_details'],
    })

    const shippingDetails = session.customer_details?.address
    const cartItems = JSON.parse(session.metadata?.cartItems || '[]')

    if (!shippingDetails) {
      return NextResponse.json({ error: 'No shipping details found' }, { status: 400 })
    }

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'No items found in the cart' }, { status: 400 })
    }

    const printfulItems = cartItems.map((item: any) => ({
      sync_variant_id: item.variant_id,
      quantity: item.quantity,
    }))

    const printfulOrderData = {
      recipient: {
        name: session.customer_details?.name || '',
        address1: shippingDetails.line1 || '',
        address2: shippingDetails.line2 || '',
        city: shippingDetails.city || '',
        state_code: shippingDetails.state || '',
        country_code: shippingDetails.country || '',
        zip: shippingDetails.postal_code || '',
      },
      items: printfulItems,
      retail_costs: {
        currency: 'EUR',
        subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
        total: session.amount_total ? session.amount_total / 100 : 0,
      },
      is_draft: true,
    }

    console.log('Printful order data:', JSON.stringify(printfulOrderData, null, 2))

    const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(printfulOrderData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Printful order creation error:', errorData)
      return NextResponse.json({ error: 'Failed to create Printful order', details: errorData }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, orderId: data.result.id })
  } catch (error) {
    console.error('Error creating draft order with Printful:', error)
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 })
  }
}