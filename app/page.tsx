// "use client"
// import Link from 'next/link'
// import { Canvas } from '@react-three/fiber'
// import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
// import Model from './models/model'

// export default function Home() {
//   return (
//     <div className="flex flex-col min-h-screen bg-base-100">
//       <main className="flex-grow relative">


//         <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
//           <Link href="/products" className="hero-content hover:scale-125 duration-500 cursor-pointer transition-all text-center text-neutral-content p-4 bg-base-200">
//             <div className="w-min flex flex-col">
//               <div className="h-[30rem] w-[30rem] aspect-square bg-[#5e7f43]">
//                 {/* <img 
//                 className="object-contain w-full h-full"
//                 src="/images/okapi-antwerp-zoo.jpg"/> */}
//                 <Canvas>
//                   <PerspectiveCamera zoom={1.5} makeDefault position={[0, 5, 10]} />
//                   <OrbitControls enableZoom={false} enablePan={false} />
//                   <ambientLight intensity={1} />
//                   <pointLight intensity={100} position={[0, 20, 0]} />
//                   <Model rotation={[0, -Math.PI / 4, 0]} position={[
//                     0, -3, 0
//                   ]} />
//                 </Canvas>
//               </div>
//               <span className="flex flex-col w-full">
//                 <h1 className="mb-5 text-5xl font-bold mt-2 text-primary">Shop the Okapi Collection</h1>
//                 {/* <p className="mb-5 text-base-content">Discover forest finds, okapi apparel, and conservation corner.</p> */}
//                 {/* <Link href="/products" className="btn btn-primary m-4">Shop now</Link> */}
//               </span>
//             </div>
//           </Link>
//         </div>
//       </main>
//     </div>
//   )
// }


/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/productCard'
import { useCartStore } from '@/store/cartStore'
import { Product } from '@/types/product'

export default function ProductsPage() {
  const [selectedTag, setSelectedTag] = useState('All')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [allTags, setAllTags] = useState<string[]>(['All'])
  const products: any = useCartStore((state) => state.products)
  const fetchProducts = useCartStore((state) => state.fetchProducts)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    console.log(products)
    // @ts-ignore
    const tags = ['All', ...new Set(products.flatMap(product => product.tags))]
    setAllTags(tags)

    if (selectedTag === 'All') {
      setFilteredProducts(products as any)
    } else {
      setFilteredProducts(products.filter((product: { tags: string | string[] }) => product.tags.includes(selectedTag)) as any)
    }
  }, [selectedTag, products])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-2 mb-8">
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`btn btn-sm ${selectedTag === tag ? 'btn-primary' : 'btn-outline btn-primary'}`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      {filteredProducts.length === 0 ? (
        <p className="text-neutral text-center">No products found with this tag.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              {/* @ts-ignore */}
              <ProductCard product={product} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}