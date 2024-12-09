'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, User, Menu, X, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { Cart } from '@/components/cart'
import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useState } from 'react'
import { ThemeToggle } from './theme-toggle'

export function Header() {
	const { data: session, status } = useSession()
	const { getTotalItems, toggleCart, isCartOpen, fetchProducts } = useCartStore()
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	useEffect(() => {
		fetchProducts()
	}, [fetchProducts])

	return (
		<>
			<header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 dark:bg-neutral-950/80 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60">
				<div className="container mx-auto px-4">
					<div className="flex h-16 items-center justify-between">
						{/* Logo */}
						<Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
							<Image 
								src="/images/okapi-logo.png" 
								alt="The Okapi Store Logo" 
								width={32} 
								height={32}
								className="w-8 h-8"
							/>
							<span className="hidden sm:block font-medium">The Okapi Store</span>
						</Link>

						{/* Desktop navigation */}
						<nav className="hidden lg:flex items-center gap-8">
							<Link 
								href="/about" 
								className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
							>
								About
							</Link>
							{/* {status === "loading" ? (
								<div className="h-5 w-20 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded" />
							) : session ? (
								<div className="flex items-center gap-6">
									<div className="dropdown dropdown-end">
										<label tabIndex={0} className="flex items-center gap-2 cursor-pointer text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors">
											<Image
												src={session.user?.image || '/images/default-avatar.png'}
												alt={session.user?.name || 'User'}
												width={32}
												height={32}
												className="rounded-full"
											/>
											<span>{session.user?.name}</span>
										</label>
										<ul tabIndex={0} className="dropdown-content z-[1] mt-2 p-2 shadow-lg bg-white dark:bg-neutral-900 rounded-lg w-52 text-sm border border-neutral-200 dark:border-neutral-800">
											<li>
												<Link 
													href="/orders" 
													className="block px-4 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
												>
													My Orders
												</Link>
											</li>
											<li>
												<button 
													onClick={() => signOut()} 
													className="w-full text-left px-4 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
												>
													Sign Out
												</button>
											</li>
										</ul>
									</div>
								</div>
							) : (
								<button
									onClick={() => signIn()}
									className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
								>
									Sign In
								</button>
							)} */}
							<div className="flex items-center gap-4">
								<button 
									onClick={toggleCart}
									className="relative p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
								>
									<ShoppingCart className="w-5 h-5" />
									{getTotalItems() > 0 && (
										<span className="absolute -top-1 -right-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50">
											{getTotalItems()}
										</span>
									)}
								</button>
								<ThemeToggle />
							</div>
						</nav>

						{/* Mobile menu button */}
						<button
							className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							{isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
						</button>
					</div>
				</div>

				{/* Mobile menu */}
				<div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
					<nav className="container mx-auto px-4 py-4 space-y-4 bg-white/95 dark:bg-neutral-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60 border-t border-neutral-200 dark:border-neutral-800">
						<Link
							href="/about"
							className="block text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
							onClick={() => setIsMenuOpen(false)}
						>
							About
						</Link>
						{/* {status === "authenticated" ? (
							<>
								<Link
									href="/orders"
									className="block text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
									onClick={() => setIsMenuOpen(false)}
								>
									My Orders
								</Link>
								<button
									onClick={() => {
										signOut()
										setIsMenuOpen(false)
									}}
									className="block w-full text-left text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
								>
									Sign Out
								</button>
							</>
						) : (
							<button
								onClick={() => {
									signIn()
									setIsMenuOpen(false)
								}}
								className="block w-full text-left text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
							>
								Sign In
							</button>
						)} */}
						<div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800">
							<ThemeToggle />
						</div>
					</nav>
				</div>
			</header>

			{isCartOpen && <Cart />}
		</>
	)
}