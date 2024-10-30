// Components/ProductCard.tsx
import Image from 'next/image';
import { formatEuroPrice } from '@/utils/formatters';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  variant_id: number;
  currency?: string;
}

export function ProductCard({ product }: { product: Product }) {
  const formattedPrice = formatEuroPrice(product.price);

  return (
    <div className="flex flex-col">
      <figure>
        <img
          src={product.image}
          alt={product.name}
          className="w-full bg-transparent h-full object-contain"
        />
      </figure>
      <div className="flex justify-between text-sm font-bold">
        <h2 className="">{product.name}</h2>
        <p>{formattedPrice}</p>
      </div>
    </div>
  );
}