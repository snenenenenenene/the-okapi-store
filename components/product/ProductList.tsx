import { ProductGrid } from './ProductGrid';

async function getProducts() {
  const res = await fetch('/api/printful/products', {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}

export async function ProductList() {
  const products = await getProducts();
  return <ProductGrid products={products} />;
}
