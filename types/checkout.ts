// /types/checkout.ts

export interface ShippingAddress {
	name: string;
	email: string;
	phone: string;
	address1: string;
	address2?: string;
	city: string;
	state: string;
	country: string;
	zip: string;
  }
  
  export interface CheckoutState {
	step: 'shipping' | 'review' | 'payment';
	shippingAddress: ShippingAddress;
	stripeSessionId?: string;
	orderId?: string;
	error?: string;
	isProcessing: boolean;
	cart?: CheckoutItem[];
  }
  
  export interface ShippingRate {
	id: string;
	name: string;
	price: number;
	currency: string;
	estimatedDays: number;
  }
  
  export interface CheckoutItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	variant_id: number;
	image: string;
  }
  
  export interface PrintfulOrderData {
	recipient: {
	  name: string;
	  address1: string;
	  address2?: string;
	  city: string;
	  state_code: string;
	  country_code: string;
	  zip: string;
	  email: string;
	  phone: string;
	};
	items: {
	  sync_variant_id: number;
	  quantity: number;
	}[];
	retail_costs: {
	  currency: string;
	  subtotal: number;
	  total: number;
	};
  }
  
  export interface StripeSessionData {
	items: CheckoutItem[];
	shippingAddress: ShippingAddress;
	shippingRate?: ShippingRate;
	metadata?: Record<string, string>;
  }
  
  export class CheckoutError extends Error {
	code?: string;
	details?: any;
  
	constructor(message: string, details?: any) {
	  super(message);
	  this.name = 'CheckoutError';
	  this.details = details;
	}
  }
  
  export const SUPPORTED_COUNTRIES = [
	{ code: 'BE', name: 'Belgium' },
	{ code: 'NL', name: 'Netherlands' },
	{ code: 'LU', name: 'Luxembourg' },
	{ code: 'DE', name: 'Germany' },
	{ code: 'FR', name: 'France' },
  ] as const;
  
  export type SupportedCountry = typeof SUPPORTED_COUNTRIES[number]['code'];