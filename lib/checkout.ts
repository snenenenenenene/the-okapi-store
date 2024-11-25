// /lib/checkout.ts

import { 
	CheckoutError, 
	PrintfulOrderData, 
	ShippingAddress, 
	StripeSessionData 
  } from "@/types/checkout";
  
  export class CheckoutService {
	static async createStripeSession(data: StripeSessionData): Promise<{ sessionId: string }> {
	  const response = await fetch('/api/stripe/create-session', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	  });
  
	  if (!response.ok) {
		const error = await response.json();
		throw new CheckoutError('Failed to create Stripe session', error);
	  }
  
	  return response.json();
	}
  
	static async validateShippingAddress(address: ShippingAddress): Promise<boolean> {
	  const requiredFields: (keyof ShippingAddress)[] = [
		'name', 'email', 'phone', 'address1', 'city', 'state', 'country', 'zip'
	  ];
  
	  const missingFields = requiredFields.filter(field => !address[field]);
	  if (missingFields.length > 0) {
		throw new CheckoutError(
		  'Missing required fields',
		  { fields: missingFields }
		);
	  }
  
	  // Validate email format
	  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	  if (!emailRegex.test(address.email)) {
		throw new CheckoutError('Invalid email address');
	  }
  
	  // Validate phone format (basic)
	  const phoneRegex = /^\+?[\d\s-]{10,}$/;
	  if (!phoneRegex.test(address.phone)) {
		throw new CheckoutError('Invalid phone number');
	  }
  
	  // Validate postal code format per country
	  const postalCodePatterns: Record<string, RegExp> = {
		BE: /^[0-9]{4}$/,
		NL: /^[1-9][0-9]{3}(?!sa|sd|ss)[a-z]{2}$/i,
		LU: /^[0-9]{4}$/,
		DE: /^[0-9]{5}$/,
		FR: /^[0-9]{5}$/,
	  };
  
	  const pattern = postalCodePatterns[address.country];
	  if (pattern && !pattern.test(address.zip)) {
		throw new CheckoutError('Invalid postal code for selected country');
	  }
  
	  return true;
	}
  
	static async calculateShippingRates(address: ShippingAddress): Promise<any> {
	  const response = await fetch('/api/printful/shipping-rates', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ address }),
	  });
  
	  if (!response.ok) {
		throw new CheckoutError('Failed to calculate shipping rates');
	  }
  
	  return response.json();
	}
  
	static formatPrintfulOrder(
	  address: ShippingAddress,
	  items: any[],
	  total: number
	): PrintfulOrderData {
	  return {
		recipient: {
		  name: address.name,
		  address1: address.address1,
		  address2: address.address2,
		  city: address.city,
		  state_code: address.state,
		  country_code: address.country,
		  zip: address.zip,
		  email: address.email,
		  phone: address.phone,
		},
		items: items.map(item => ({
		  sync_variant_id: item.variant_id,
		  quantity: item.quantity,
		})),
		retail_costs: {
		  currency: 'EUR',
		  subtotal: total,
		  total: total,
		},
	  };
	}
  
	static async verifyPayment(sessionId: string): Promise<boolean> {
	  const response = await fetch(`/api/stripe/verify-payment?session_id=${sessionId}`);
	  
	  if (!response.ok) {
		throw new CheckoutError('Payment verification failed');
	  }
  
	  const { status } = await response.json();
	  return status === 'paid';
	}
  }