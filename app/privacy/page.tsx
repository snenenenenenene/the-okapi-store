// app/privacy/page.tsx
'use client'

import { motion } from 'framer-motion'
import { Lock, Share2, Shield, UserCheck } from 'lucide-react'

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

export default function PrivacyPage() {
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
						Privacy Policy
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-xl font-light text-neutral/80 max-w-2xl"
					>
						Your privacy is important to us. Learn how The Okapi Store collects, uses, and protects your personal information.
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
						<Shield className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">Data Protection</h3>
						<p className="text-neutral/70">Your data is securely stored and protected using industry-standard encryption.</p>
					</div>

					<div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
						<UserCheck className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">Your Rights</h3>
						<p className="text-neutral/70">Access, modify, or delete your personal information at any time.</p>
					</div>

					<div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
						<Share2 className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">Data Sharing</h3>
						<p className="text-neutral/70">We only share your data with trusted partners necessary for our services.</p>
					</div>

					<div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
						<Lock className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
						<h3 className="font-serif text-lg mb-3 text-neutral">Cookie Control</h3>
						<p className="text-neutral/70">Manage your cookie preferences and control your data usage.</p>
					</div>
				</motion.div>

				{/* Detailed Sections */}
				<div className="max-w-4xl mx-auto space-y-24">
					<motion.section variants={item} className="space-y-8">
						<h2 className="text-2xl font-serif text-neutral">Information We Collect</h2>
						<div className="space-y-4">
							<div className="group hover:bg-primary/5 p-6 rounded-lg transition-all duration-300">
								<h3 className="font-serif text-lg text-neutral mb-2">Personal Information</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Name and contact information
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Shipping and billing addresses
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Payment information
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Order history
									</li>
								</ul>
							</div>
						</div>
					</motion.section>

					<motion.section variants={item} className="space-y-8">
						<h2 className="text-2xl font-serif text-neutral">How We Use Your Information</h2>
						<div className="grid md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<h3 className="font-serif text-lg text-neutral">Essential Uses</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Processing your orders
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Providing customer support
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Sending order updates
									</li>
								</ul>
							</div>

							<div className="space-y-4">
								<h3 className="font-serif text-lg text-neutral">Optional Uses</h3>
								<ul className="space-y-2 text-neutral/70">
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Marketing communications
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Product recommendations
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-primary"></div>
										Website analytics
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
						<h2 className="text-2xl font-serif text-neutral">Contact Us About Privacy</h2>
						<p className="text-neutral/70 max-w-2xl">
							Have questions about our privacy practices? Our team is here to help.
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