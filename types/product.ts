// types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  variants: Variant[];
  tags?: string[];
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Variant {
  id: number;
  name: string;
  price: number;
  size: string;
  currency: string;
  inStock?: boolean;
  sku?: string;
  color?: string;
}
