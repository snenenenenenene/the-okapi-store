// app/returns/page.tsx
'use client'

import { Truck, RefreshCw, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1
		}
	}
}

const item = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 }
}

export default function ReturnsPage() {
	return (
		<div className="min-h-screen bg-base-100">
			{/* Hero Section */}
			<div className="bg-primary/5">
				<div className="container mx-auto px-6 py-24">
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-4xl md:text-6xl font-serif mb-6 text-neutral"
					>
						Returns &amp; Exchanges
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-xl font-light text-neutral/80 max-w-2xl"
					>
						We want you to love your Okapi items. If you&apos;re not completely satisfied, we&apos;re here to help.
					</motion.p>
				</div>
			</div>

			{/* Policy Overview */}
			<motion.div
				variants={container}
				initial="hidden"
				animate="show"
				className="container mx-auto px-6 py-24"
			>
				<motion.div
					variants={item}
					className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
				>
					<div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
						<Truck className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">Free Returns</h3>
						<p className="text-neutral/70">Complimentary return shipping for Benelux customers.</p>
					</div>

					<div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
						<RefreshCw className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">Simple Exchanges</h3>
						<p className="text-neutral/70">Need a different size? We&apos;ll make it effortless.</p>
					</div>

					<div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
						<Clock className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">30-Day Window</h3>
						<p className="text-neutral/70">One month to ensure you&apos;re completely satisfied.</p>
					</div>

					<div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
						<AlertCircle className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">Quality Promise</h3>
						<p className="text-neutral/70">Full refund or replacement for any defects.</p>
					</div>
				</motion.div>

				{/* Detailed Policy */}
				<div className="max-w-4xl mx-auto space-y-24">
					<motion.section variants={item} className="space-y-8">
						<h2 className="text-2xl font-serif text-neutral">Return Policy Details</h2>

						<div className="grid md:grid-cols-2 gap-12">
							<div className="space-y-4">
								<h3 className="font-serif text-lg text-neutral">Eligible Items</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Unused and in original condition
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Original packaging intact
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Unworn and undamaged
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Proof of purchase included
									</li>
								</ul>
							</div>

							<div className="space-y-4">
								<h3 className="font-serif text-lg text-neutral">Non-Returnable Items</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Custom or personalized orders
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Final sale items
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Items showing wear or washing
									</li>
								</ul>
							</div>
						</div>
					</motion.section>

					<motion.section variants={item} className="space-y-8">
						<h2 className="text-2xl font-serif text-neutral">Return Process</h2>
						<div className="grid gap-8">
							{[
								{
									step: "01",
									title: "Initiate Return",
									description: "Email okapistore@gmail.com with your order number"
								},
								{
									step: "02",
									title: "Receive Label",
									description: "We'll send your return authorization and shipping label"
								},
								{
									step: "03",
									title: "Package Items",
									description: "Securely pack items in their original condition"
								},
								{
									step: "04",
									title: "Ship Return",
									description: "Drop off package using provided shipping label"
								},
								{
									step: "05",
									title: "Refund",
									description: "Receive refund within 5-7 business days of receipt"
								}
							].map((item) => (
								<div key={item.step} className="flex gap-8 items-start p-6 hover:bg-primary/5 rounded-lg transition-all duration-300">
									<span className="font-serif text-4xl text-primary/30">{item.step}</span>
									<div>
										<h3 className="font-serif text-lg text-neutral mb-2">{item.title}</h3>
										<p className="text-neutral/70">{item.description}</p>
									</div>
								</div>
							))}
						</div>
					</motion.section>

					<motion.section variants={item} className="space-y-8">
						<h2 className="text-2xl font-serif text-neutral">Shipping Information</h2>
						<div className="grid md:grid-cols-2 gap-12">
							<div className="space-y-4">
								<h3 className="font-serif text-lg text-neutral">Free Returns</h3>
								<p className="text-neutral/70">
									We offer free return shipping for all orders within:
								</p>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Belgium
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Netherlands
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Luxembourg
									</li>
								</ul>
							</div>

							<div className="space-y-4">
								<h3 className="font-serif text-lg text-neutral">International Returns</h3>
								<p className="text-neutral/70">
									Customers outside Benelux are responsible for return shipping costs.
									We recommend using a tracked service.
								</p>
							</div>
						</div>
					</motion.section>

					<motion.section
						variants={item}
						className="bg-primary/5 p-12 rounded-lg space-y-6"
					>
						<h2 className="text-2xl font-serif text-neutral">Need Assistance?</h2>
						<p className="text-neutral/70 max-w-2xl">
							Our customer service team is here to help with any questions about returns or exchanges.
						</p>
						<div className="grid md:grid-cols-3 gap-8">
							<div>
								<p className="font-serif text-neutral">Email</p>
								<p className="text-neutral/70">okapistore@gmail.com</p>
							</div>
							<div>
								<p className="font-serif text-neutral">Phone</p>
								<p className="text-neutral/70">&#43;32 (0) 470 976 709</p>
							</div>
							<div>
								<p className="font-serif text-neutral">Hours</p>
								<p className="text-neutral/70">Mon-Fri, 9:00-17:00 CET</p>
							</div>
						</div>
					</motion.section>
				</div>
			</motion.div>
		</div>
	)
}