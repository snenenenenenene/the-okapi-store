// app/terms/page.tsx
'use client'

import { motion } from 'framer-motion'
import { FileText, HelpCircle, Scale, ShieldCheck } from 'lucide-react'
import { Suspense } from 'react'

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

function TermsPage() {
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
						Terms of Service
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-xl font-light text-neutral/80 max-w-2xl"
					>
						Please read these terms carefully before using our services.
					</motion.p>
				</div>
			</div>

			{/* Main Content */}
			<motion.div
				variants={container}
				initial="hidden"
				animate="show"
				className="container mx-auto px-6 py-24"
			>
				{/* Key Points */}
				<motion.div
					variants={item}
					className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
				>
					<div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
						<Scale className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">Fair Usage</h3>
						<p className="text-neutral/70">Guidelines for using our website and services responsibly.</p>
					</div>

					<div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
						<FileText className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">Orders & Payment</h3>
						<p className="text-neutral/70">Terms regarding purchases, payments, and order fulfillment.</p>
					</div>

					<div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
						<ShieldCheck className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">Your Rights</h3>
						<p className="text-neutral/70">Understanding your rights and responsibilities as a customer.</p>
					</div>

					<div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
						<HelpCircle className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">Support</h3>
						<p className="text-neutral/70">How to get help and resolve issues.</p>
					</div>
				</motion.div>

				{/* Detailed Sections */}
				<div className="max-w-4xl mx-auto space-y-24">
					{/* Account Terms */}
					<motion.section variants={item} className="space-y-8">
						<h2 className="text-2xl font-serif text-neutral">Account Terms</h2>
						<div className="space-y-4">
							<div className="group hover:bg-primary/5 p-6 rounded-lg transition-all duration-300">
								<h3 className="font-serif text-lg text-neutral mb-2">Account Requirements</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Must be at least 18 years old
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Provide accurate personal information
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Maintain account security
									</li>
								</ul>
							</div>
						</div>
					</motion.section>

					{/* Orders & Payment */}
					<motion.section variants={item} className="space-y-8">
						<h2 className="text-2xl font-serif text-neutral">Orders & Payment</h2>
						<div className="grid md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<h3 className="font-serif text-lg text-neutral">Order Process</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Order confirmation and processing
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Shipping and delivery terms
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Order cancellation rights
									</li>
								</ul>
							</div>

							<div className="space-y-4">
								<h3 className="font-serif text-lg text-neutral">Payment Terms</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Accepted payment methods
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Currency and pricing
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Payment security
									</li>
								</ul>
							</div>
						</div>
					</motion.section>

					{/* Product Terms */}
					<motion.section variants={item} className="space-y-8">
						<h2 className="text-2xl font-serif text-neutral">Product Terms</h2>
						<div className="grid md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<h3 className="font-serif text-lg text-neutral">Product Information</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Product descriptions and images
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Pricing and availability
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Quality standards
									</li>
								</ul>
							</div>

							<div className="space-y-4">
								<h3 className="font-serif text-lg text-neutral">Product Usage</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Personal use only
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Intellectual property rights
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Resale restrictions
									</li>
								</ul>
							</div>
						</div>
					</motion.section>

					{/* User Responsibilities */}
					<motion.section variants={item} className="space-y-8">
						<h2 className="text-2xl font-serif text-neutral">Your Responsibilities</h2>
						<div className="space-y-4">
							<div className="group hover:bg-primary/5 p-6 rounded-lg transition-all duration-300">
								<h3 className="font-serif text-lg text-neutral mb-2">Account Security</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Keep login credentials secure
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Report unauthorized access
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Update personal information
									</li>
								</ul>
							</div>

							<div className="group hover:bg-primary/5 p-6 rounded-lg transition-all duration-300">
								<h3 className="font-serif text-lg text-neutral mb-2">Acceptable Use</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										No unauthorized use
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Comply with all laws
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Respect intellectual property
									</li>
								</ul>
							</div>
						</div>
					</motion.section>

					{/* Contact Section */}
					<motion.section
						variants={item}
						className="bg-primary/5 p-12 rounded-lg space-y-6"
					>
						<h2 className="text-2xl font-serif text-neutral">Questions About Our Terms?</h2>
						<p className="text-neutral/70 max-w-2xl">
							If you have any questions about our terms of service, please don&apos;t hesitate to contact us.
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

					{/* Last Updated */}
					<motion.div
						variants={item}
						className="text-center text-neutral/70"
					>
						<p>Last updated: {new Date().toLocaleDateString()}</p>
					</motion.div>
				</div>
			</motion.div>
		</div>
	)
}

export default function TermsPageWrapper() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<TermsPage />
		</Suspense>
	)
}