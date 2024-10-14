import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'

interface Product {
  id: string
  name: string
  price: number
  image: string
  variant_id: number // Add this line
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)

  console.log(product)
  return (
    <div className="flex flex-col">
      <figure>
        <img src={product.image} alt={product.name} className="w-full bg-transparent h-full object-contain" />
      </figure>
      <div className="flex justify-between text-sm font-bold">
        <h2 className="">{product.name}</h2>
        <p>{product.currency} {product.price}</p>
      </div>
    </div>
  )
}