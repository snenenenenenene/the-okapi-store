'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Product {
	id: string
	name: string
	description: string
	price: number
	image: string
	tags: string[]
	category: string
	inStock: number
}

interface Purchase {
	id: string
	userId: string
	totalAmount: number
	items: { productId: string; quantity: number }[]
	createdAt: string
}

export default function Dashboard() {
	const { data: session, status } = useSession()
	const router = useRouter()

	const [products, setProducts] = useState<Product[]>([])
	const [purchases, setPurchases] = useState<Purchase[]>([])
	const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
		name: '',
		description: '',
		price: 0,
		image: '',
		tags: [],
		category: '',
		inStock: 0,
	})

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/login')
		} else if (status === 'authenticated' && session.user.role !== 'admin') {
			router.push('/')
		} else {
			fetchProducts()
			fetchPurchases()
		}
	}, [status, session, router])

	const fetchProducts = async () => {
		// Implementation remains the same
	}

	const fetchPurchases = async () => {
		// Implementation remains the same
	}

	const handleAddProduct = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const response = await fetch('/api/products', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newProduct),
			})
			if (response.ok) {
				fetchProducts()
				setNewProduct({ name: '', description: '', price: 0, image: '', tags: [], category: '', inStock: 0 })
			}
		} catch (error) {
			console.error('Failed to add product:', error)
		}
	}

	const handleRemoveProduct = async (productId: string) => {
		// Implementation remains the same
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target
		setNewProduct(prev => ({
			...prev,
			[name]: name === 'tags' ? value.split(',').map(tag => tag.trim()) :
				name === 'price' || name === 'inStock' ? Number(value) : value
		}))
	}

	if (status === 'loading') {
		return <div>Loading...</div>
	}

	return (
		<div className="space-y-8">
			<h1 className="text-3xl font-bold">Dashboard</h1>

			<div className="card bg-base-200 shadow-xl">
				<div className="card-body">
					<h2 className="card-title">Add New Product</h2>
					<form onSubmit={handleAddProduct} className="space-y-4">
						<input
							type="text"
							name="name"
							value={newProduct.name}
							onChange={handleInputChange}
							placeholder="Product Name"
							className="input input-bordered w-full"
							required
						/>
						<textarea
							name="description"
							value={newProduct.description}
							onChange={handleInputChange}
							placeholder="Product Description"
							className="textarea textarea-bordered w-full"
							required
						/>
						<input
							type="number"
							name="price"
							value={newProduct.price}
							onChange={handleInputChange}
							placeholder="Price"
							className="input input-bordered w-full"
							required
						/>
						<input
							type="text"
							name="image"
							value={newProduct.image}
							onChange={handleInputChange}
							placeholder="Image URL"
							className="input input-bordered w-full"
							required
						/>
						<input
							type="text"
							name="tags"
							value={newProduct.tags.join(', ')}
							onChange={handleInputChange}
							placeholder="Tags (comma-separated)"
							className="input input-bordered w-full"
						/>
						<input
							type="text"
							name="category"
							value={newProduct.category}
							onChange={handleInputChange}
							placeholder="Category"
							className="input input-bordered w-full"
							required
						/>
						<input
							type="number"
							name="inStock"
							value={newProduct.inStock}
							onChange={handleInputChange}
							placeholder="In Stock"
							className="input input-bordered w-full"
							required
						/>
						<button type="submit" className="btn btn-primary">Add Product</button>
					</form>
				</div>
			</div>

			<div className="card bg-base-200 shadow-xl">
				<div className="card-body">
					<h2 className="card-title">Products</h2>
					<div className="overflow-x-auto">
						<table className="table w-full">
							<thead>
								<tr>
									<th>Name</th>
									<th>Price</th>
									<th>Category</th>
									<th>In Stock</th>
									<th>Tags</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{products.map(product => (
									<tr key={product.id}>
										<td>{product.name}</td>
										<td>${product.price.toFixed(2)}</td>
										<td>{product.category}</td>
										<td>{product.inStock}</td>
										<td>{product.tags.join(', ')}</td>
										<td>
											<button onClick={() => handleRemoveProduct(product.id)} className="btn btn-sm btn-error">
												Remove
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<div className="card bg-base-200 shadow-xl">
				<div className="card-body">
					<h2 className="card-title">Recent Purchases</h2>
					<div className="overflow-x-auto">
						<table className="table w-full">
							<thead>
								<tr>
									<th>Purchase ID</th>
									<th>User ID</th>
									<th>Total Amount</th>
									<th>Date</th>
								</tr>
							</thead>
							<tbody>
								{purchases.map(purchase => (
									<tr key={purchase.id}>
										<td>{purchase.id}</td>
										<td>{purchase.userId}</td>
										<td>${purchase.totalAmount.toFixed(2)}</td>
										<td>{new Date(purchase.createdAt).toLocaleDateString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}