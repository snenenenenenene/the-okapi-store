export interface OrderItem {
	id: string;
	quantity: number;
	price: number;
	product: {
	  id: string;
	  name: string;
	  image: string;
	};
  }
  
  export interface OrderAssociation {
	id: string;
	type: 'CUSTOMER' | 'CREATOR';
	user: {
	  id: string;
	  email: string;
	  name: string | null;
	};
  }
  
  export interface Order {
	id: string;
	createdAt: string;
	status: string;
	total: number;
	orderItems: OrderItem[];
	printfulId?: string;
	printfulStatus?: string;
	trackingNumber?: string;
	trackingUrl?: string;
	estimatedDelivery?: string;
	associations: OrderAssociation[];
  }