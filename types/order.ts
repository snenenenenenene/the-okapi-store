export interface OrderItem {
	id: string;
	quantity: number;
	price: number;
	productId: string;
  }
  
  export interface Order {
	id: string;
	status: string;
	total: number;
	stripeData: {
	  sessionId: string | null;
	  paymentIntentId: string | null;
	};
	shipping: {
	  trackingNumber: string | null;
	  trackingUrl: string | null;
	};
	fulfillment: {
	  printfulId: string | null;
	  status: string | null;
	};
  }