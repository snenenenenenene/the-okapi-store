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
	const products = useCartStore((state) => state.products)
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
			setFilteredProducts(products)
		} else {
			setFilteredProducts(products.filter(product => product.tags.includes(selectedTag)))
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
							<ProductCard product={product} />
						</Link>
					))}
				</div>
			)}
		</div>
	)
}