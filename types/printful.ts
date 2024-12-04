export interface PrintfulSyncProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url: string;
  is_ignored: boolean;
}

export interface PrintfulProductVariant {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  main_category_id: number;
  warehouse_product_id: number | null;
  warehouse_product_variant_id: number | null;
  retail_price: string;
  sku: string;
  currency: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  files: PrintfulFile[];
  options: PrintfulOption[];
  is_ignored: boolean;
  size: string;
  color: string;
  availability_status: 'active' | 'hidden' | 'out_of_stock';
}

export interface PrintfulFile {
  id: number;
  type: string;
  hash: string;
  url: string | null;
  filename: string;
  mime_type: string;
  size: number;
  width: number;
  height: number;
  dpi: number | null;
  status: string;
  created: number;
  thumbnail_url: string;
  preview_url: string;
  visible: boolean;
  is_temporary: boolean;
  message: string;
  options?: {
    id: string;
    value: any;
  }[];
  stitch_count_tier: any | null;
}

export interface PrintfulOption {
  id: string;
  value: any;
}

export interface PrintfulProductResponse {
  sync_product: PrintfulSyncProduct;
  sync_variants: PrintfulVariant[];
}

// Helper type for converting Printful response to our Product type
export interface PrintfulProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  variants: {
    id: number;
    name: string;
    price: number;
    size: string;
    color: string;
    sku: string;
    inStock: boolean;
  }[];
  inStock: boolean;
  category?: string;
  thumbnail: string;
  previewImage: string;
}
