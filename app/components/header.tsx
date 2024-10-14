'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, User, Search } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { Cart } from '@/components/cart'
import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect } from 'react'

export function Header() {
	const { data: session, status } = useSession()
	const { getTotalItems, toggleCart, isCartOpen, fetchProducts } = useCartStore()

	useEffect(() => {
		fetchProducts()
	}, [fetchProducts])

	return (
		<header className="bg-base-100 text-neutral font-serif">
			<div className="container mx-auto px-4 navbar">
				<div className="flex-1">
					<Link href="/" className="btn btn-ghost normal-case text-xl">
						<Image src="/images/okapi-logo.png" alt="The Okapi Store Logo" width={40} height={40} />
						<span className="ml-2">The Okapi Store</span>
					</Link>
				</div>
				<div className="flex-none">
					<ul className="menu menu-horizontal px-1 flex items-center">
						<li><Link href="/products" className="hover:text-primary mr-2">Shop</Link></li>
						<li><Link href="/about" className="hover:text-primary">About</Link></li>
						<li>
							<button className="btn btn-ghost btn-circle">
								<Search size={20} />
							</button>
						</li>
						<li>
							<button className="btn btn-ghost btn-circle" onClick={toggleCart}>
								<div className="indicator">
									<ShoppingBag size={20} />
									{getTotalItems() > 0 && (
										<span className="badge badge-sm indicator-item badge-secondary">{getTotalItems()}</span>
									)}
								</div>
							</button>
						</li>
						<li>
							{status === "authenticated" ? (
								<div className="dropdown dropdown-end">
									<label tabIndex={0} className="btn btn-ghost btn-circle avatar">
										<div className="w-10 rounded-full">
											<Image
												src={session.user?.image || '/images/default-avatar.png'}
												alt={session.user?.name || 'User'}
												width={40}
												height={40}
											/>
										</div>
									</label>
									<ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
										<li><a className="justify-between">Profile</a></li>
										<li><a>Settings</a></li>
										<li><a onClick={() => signOut()}>Logout</a></li>
									</ul>
								</div>
							) : (
								<button onClick={() => signIn('google')} className="btn btn-ghost btn-circle">
									<User size={20} />
								</button>
							)}
						</li>
					</ul>
				</div>
			</div>
			{isCartOpen && <Cart />}
		</header>
	)
}