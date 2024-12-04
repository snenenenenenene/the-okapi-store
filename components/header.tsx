'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { Cart } from '@/components/cart'
import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useState } from 'react'

export function Header() {
	const { data: session, status } = useSession()
	const { getTotalItems, toggleCart, isCartOpen, fetchProducts } = useCartStore()
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	useEffect(() => {
		fetchProducts()
	}, [fetchProducts])

	return (
		<header className="bg-base-100 text-neutral font-satoshi">
			<div className="container mx-auto px-4 navbar">
				<div className="flex-1">
					<Link href="/" className="btn btn-ghost normal-case text-xl">
						<Image src="/images/okapi-logo.png" alt="The Okapi Store Logo" width={40} height={40} />
						<span className="ml-2 hidden sm:inline">The Okapi Store</span>
					</Link>
				</div>

				<div className="flex items-center gap-2">
					{/* Cart - Always visible */}
					<button className="btn btn-ghost btn-circle" onClick={toggleCart}>
						<div className="indicator">
							<ShoppingBag size={20} />
							{getTotalItems() > 0 && (
								<span className="badge badge-sm indicator-item badge-secondary">{getTotalItems()}</span>
							)}
						</div>
					</button>

					{/* User menu - Always visible */}
					<div className="hidden sm:block">
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
									<li><Link href="/orders">My Orders</Link></li>
									<li><a onClick={() => signOut()}>Logout</a></li>
								</ul>
							</div>
						) : (
							<button onClick={() => signIn('google')} className="btn btn-ghost btn-circle">
								<User size={20} />
							</button>
						)}
					</div>

					{/* Mobile menu button */}
					<button
						className="btn btn-ghost lg:hidden"
						onClick={() => setIsMenuOpen(!isMenuOpen)}
					>
						{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>

					{/* Desktop navigation */}
					<div className="hidden lg:flex">
						<ul className="menu menu-horizontal px-1 flex items-center">
							<li><Link href="/" className="hover:text-primary">Shop</Link></li>
							<li><Link href="/about" className="hover:text-primary">About</Link></li>
						</ul>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{isMenuOpen && (
				<div className="lg:hidden">
					<ul className="menu menu-vertical px-4 py-2 bg-base-100 border-t">
						<li><Link href="/" className="py-2">Shop</Link></li>
						<li><Link href="/about" className="py-2">About</Link></li>
						<li><Link href="/orders" className="py-2">My Orders</Link></li>
						{/* Only show sign in/out in mobile menu if not shown in header */}
						<li className="sm:hidden">
							{status === "authenticated" ? (
								<a onClick={() => signOut()} className="py-2">Logout</a>
							) : (
								<a onClick={() => signIn('google')} className="py-2">Sign In</a>
							)}
						</li>
					</ul>
				</div>
			)}

			{isCartOpen && <Cart />}
		</header>
	)
}