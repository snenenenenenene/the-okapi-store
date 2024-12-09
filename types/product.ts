// types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  retail_price: number;
  variants: Variant[];
}

interface Variant {
  id: number;
  name: string;
  price: number;
  size: string;
  currency: string;
}
