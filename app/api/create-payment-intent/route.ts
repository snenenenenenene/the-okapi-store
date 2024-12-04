import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json()
  } catch (e) {
    console.error('Failed to parse request body:', e)
    return new NextResponse(
      JSON.stringify({ error: 'Invalid request body' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const { items, currency = 'eur' } = body

    if (!items?.length) {
      return new NextResponse(
        JSON.stringify({ error: 'Cart is empty' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing items:', items)

    // Calculate total amount
    const amount = items.reduce((acc: number, item: any) => {
      const itemAmount = item.price * item.quantity
      console.log(`Item ${item.id}: ${item.quantity} x ${item.price} = ${itemAmount}`)
      return acc + itemAmount
    }, 0)

    console.log('Total amount:', amount)

    if (amount <= 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid order amount' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      }
    })

    console.log('Payment intent created:', paymentIntent.id)

    // Create order
    const order = await prisma.order.create({
      data: {
        paymentIntentId: paymentIntent.id,
        status: 'pending',
        total: amount,
        subtotal: amount,
        shipping: 0,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })

    console.log('Order created:', order.id)

    return new NextResponse(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error processing payment:', error)

    let errorMessage = 'An unexpected error occurred'
    let statusCode = 500

    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = `Payment error: ${error.message}`
      statusCode = error.statusCode || 500
    } else if (error instanceof Error) {
      errorMessage = error.message
      statusCode = 400
    }

    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { 
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
