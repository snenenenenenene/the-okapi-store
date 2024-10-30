/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from 'stripe'

const PRINTFUL_API_URL = 'https://api.printful.com'
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN

interface CartItem {
  variant_id: string | number;
  quantity: number;
}

export async function createPrintfulOrder(charge: Stripe.Charge, paymentIntent: Stripe.PaymentIntent, session?: Stripe.Checkout.Session | null) {
  console.log('Creating Printful order with charge:', JSON.stringify(charge, null, 2))
  console.log('PaymentIntent:', JSON.stringify(paymentIntent, null, 2))
  console.log('Session:', JSON.stringify(session, null, 2))

  const shippingDetails = charge.shipping?.address || paymentIntent.shipping?.address || session?.shipping_details?.address
  let cartItems: CartItem[] = []

  // Try to get cartItems from different sources
  if (paymentIntent.metadata?.cartItems) {
    try {
      cartItems = JSON.parse(paymentIntent.metadata.cartItems)
    } catch (error) {
      console.error('Error parsing cartItems from PaymentIntent metadata:', error)
    }
  } else if (session?.metadata?.cartItems) {
    try {
      cartItems = JSON.parse(session.metadata.cartItems)
    } catch (error) {
      console.error('Error parsing cartItems from Session metadata:', error)
    }
  } else if (session?.line_items?.data) {
    cartItems = session.line_items.data.map((item: any) => ({
      variant_id: item.price?.product?.metadata?.variant_id,
      quantity: item.quantity
    }))
  }

  if (!shippingDetails) {
    console.error('No shipping details found in charge, paymentIntent, or session')
    throw new Error('No shipping details found')
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    console.error('No items found in the cart or invalid cart format')
    console.error('PaymentIntent metadata:', paymentIntent.metadata)
    console.error('Session metadata:', session?.metadata)
    console.error('Session line items:', session?.line_items?.data)
    throw new Error('No items found in the cart or invalid cart format')
  }

  const printfulItems = cartItems.map((item: CartItem) => {
    if (!item.variant_id || !item.quantity) {
      console.error('Invalid item in cart:', item)
      throw new Error('Invalid item format in cart')
    }
    return {
      sync_variant_id: item.variant_id,
      quantity: item.quantity,
    }
  })

  const printfulOrderData = {
    recipient: {
      name: charge.shipping?.name || paymentIntent.shipping?.name || session?.shipping_details?.name || '',
      address1: shippingDetails.line1 || '',
      address2: shippingDetails.line2 || '',
      city: shippingDetails.city || '',
      state_code: shippingDetails.state || '',
      country_code: shippingDetails.country || '',
      zip: shippingDetails.postal_code || '',
    },
    items: printfulItems,
    retail_costs: {
      currency: charge.currency.toUpperCase(),
      subtotal: charge.amount / 100,
      total: charge.amount / 100,
    },
    is_draft: true,
  }

  console.log('Printful order data:', JSON.stringify(printfulOrderData, null, 2))

  if (!PRINTFUL_TOKEN) {
    console.error('PRINTFUL_TOKEN is not set')
    throw new Error('Printful API token is not configured')
  }

  const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(printfulOrderData),
  })

  const responseData = await response.json()

  if (!response.ok) {
    console.error('Failed to create Printful order. Response:', JSON.stringify(responseData, null, 2))
    throw new Error(`Failed to create Printful order: ${JSON.stringify(responseData)}`)
  }

  return responseData
}