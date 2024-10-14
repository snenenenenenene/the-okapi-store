import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createPrintfulOrder } from '@/utils/printful'

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

console.log('STRIPE_SECRET_KEY set:', !!stripeSecretKey)
console.log('STRIPE_WEBHOOK_SECRET set:', !!endpointSecret)

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2022-11-15',
})

export async function POST(req: Request) {
  console.log("Webhook received")
  
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature')

  console.log('Stripe signature received:', !!sig)

  if (!sig) {
    console.error('No Stripe signature found in request headers')
    return NextResponse.json({ error: 'No Stripe signature found' }, { status: 400 })
  }

  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    console.log('Constructing event with:')
    console.log('Payload length:', payload.length)
    console.log('Signature length:', sig.length)
    console.log('Endpoint secret length:', endpointSecret.length)

    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret)
    console.log(`Event constructed successfully. Type: ${event.type}`)
  } catch (err: any) {
    console.error('Error constructing webhook event:', err)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the charge.succeeded event
  if (event.type === 'charge.succeeded') {
    console.log('Handling charge.succeeded event')
    const charge = event.data.object as Stripe.Charge

    try {
      console.log('Fetching associated PaymentIntent')
      const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string)
      
      console.log('PaymentIntent retrieved:', JSON.stringify(paymentIntent, null, 2))

      // Fetch the associated Session if cartItems are not in PaymentIntent metadata
      let session = null
      if (!paymentIntent.metadata.cartItems) {
        console.log('cartItems not found in PaymentIntent metadata, fetching associated Session')
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        })
        session = sessions.data[0]
        console.log('Associated Session:', JSON.stringify(session, null, 2))
      }

      console.log('Creating Printful order')
      const printfulOrder = await createPrintfulOrder(charge, paymentIntent, session)
      console.log('Printful order created successfully:', JSON.stringify(printfulOrder, null, 2))

      return NextResponse.json({ received: true, printfulOrder })
    } catch (error: any) {
      console.error('Error processing charge or creating Printful order:', error)
      console.error('Charge details:', JSON.stringify(charge, null, 2))
      console.error('PaymentIntent details:', JSON.stringify(paymentIntent, null, 2))
      return NextResponse.json({ 
        error: 'Failed to process charge or create Printful order', 
        details: error.message, 
        charge: charge,
        paymentIntent: paymentIntent
      }, { status: 500 })
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`)
  }

  // Return a response to acknowledge receipt of the event
  return NextResponse.json({ received: true })
}