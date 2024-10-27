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
		<div className="min-h-screen font-satoshi">
			{/* Hero Section */}
			<div className="bg-gray-50">
				<div className="container mx-auto px-6 py-16">
					<h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
						Returns &amp; Exchanges
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl">
						We want you to be completely satisfied with your purchase. Learn about our return policy and process below.
					</p>
				</div>
			</div>

			{/* Policy Overview */}
			<motion.div
				variants={container}
				initial="hidden"
				animate="show"
				className="container mx-auto px-6 py-16"
			>
				<motion.div variants={item} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
					<div className="bg-white p-6 rounded-lg border border-gray-200">
						<Truck className="w-8 h-8 text-gray-900 mb-4" />
						<h3 className="font-bold text-lg mb-2">Free Returns</h3>
						<p className="text-gray-600">Return shipping is free for customers in Belgium, Netherlands, and Luxembourg.</p>
					</div>

					<div className="bg-white p-6 rounded-lg border border-gray-200">
						<RefreshCw className="w-8 h-8 text-gray-900 mb-4" />
						<h3 className="font-bold text-lg mb-2">Easy Exchange</h3>
						<p className="text-gray-600">Wrong size? We&apos;ll help you get the right fit with our easy exchange process.</p>
					</div>

					<div className="bg-white p-6 rounded-lg border border-gray-200">
						<Clock className="w-8 h-8 text-gray-900 mb-4" />
						<h3 className="font-bold text-lg mb-2">30-Day Window</h3>
						<p className="text-gray-600">You have 30 days from delivery to initiate a return or exchange.</p>
					</div>

					<div className="bg-white p-6 rounded-lg border border-gray-200">
						<AlertCircle className="w-8 h-8 text-gray-900 mb-4" />
						<h3 className="font-bold text-lg mb-2">Quality Guarantee</h3>
						<p className="text-gray-600">If you receive a defective item, we&apos;ll replace it or provide a full refund.</p>
					</div>
				</motion.div>

				{/* Detailed Policy */}
				<div className="max-w-3xl mx-auto">
					<motion.div variants={item} className="prose max-w-none">
						<h2 className="text-2xl font-bold mb-6">Return Policy Details</h2>

						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-4">Eligible Items</h3>
							<p className="text-gray-600 mb-4">
								To be eligible for a return, your item must be:
							</p>
							<ul className="list-disc pl-6 text-gray-600 space-y-2">
								<li>Unused and in the same condition that you received it</li>
								<li>In the original packaging</li>
								<li>Unworn, unwashed, and undamaged</li>
								<li>Accompanied by the original receipt or proof of purchase</li>
							</ul>
						</div>

						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-4">Non-Returnable Items</h3>
							<ul className="list-disc pl-6 text-gray-600 space-y-2">
								<li>Custom or personalized orders</li>
								<li>Items marked as final sale</li>
								<li>Personal care items</li>
								<li>Items with signs of wear or washing</li>
							</ul>
						</div>

						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-4">Return Process</h3>
							<ol className="list-decimal pl-6 text-gray-600 space-y-4">
								<li>
									<strong>Initiate Your Return</strong>
									<p>Contact us at returns@okapistore.com with your order number and reason for return.</p>
								</li>
								<li>
									<strong>Receive Return Authorization</strong>
									<p>We&apos;ll send you a return authorization and shipping label (if applicable).</p>
								</li>
								<li>
									<strong>Package Your Return</strong>
									<p>Securely package the item(s) in their original condition with all tags attached.</p>
								</li>
								<li>
									<strong>Ship Your Return</strong>
									<p>Use the provided shipping label or send to our returns address.</p>
								</li>
								<li>
									<strong>Refund Processing</strong>
									<p>Once received and inspected, we&apos;ll process your refund within 5-7 business days.</p>
								</li>
							</ol>
						</div>

						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-4">Exchanges</h3>
							<p className="text-gray-600 mb-4">
								For exchanges, follow the same process as returns but specify the new size or variant you&apos;d like.
								We&apos;ll process the exchange as soon as we receive your original item.
							</p>
						</div>

						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-4">Shipping Costs</h3>
							<ul className="list-disc pl-6 text-gray-600 space-y-2">
								<li>Free return shipping for BE, NL, and LUX customers</li>
								<li>Customers outside these countries are responsible for return shipping costs</li>
								<li>We cover shipping costs for exchanges and defective items</li>
							</ul>
						</div>

						<div className="bg-gray-50 p-6 rounded-lg mt-8">
							<h3 className="text-xl font-semibold mb-4">Need Help?</h3>
							<p className="text-gray-600 mb-4">
								If you have any questions about our return policy or need assistance with a return,
								please don&apos;t hesitate to contact us:
							</p>
							<ul className="text-gray-600 space-y-2">
								<li>Email: support@okapistore.com</li>
								<li>Phone: &#43;32 (0) 123 456 789</li>
								<li>Hours: Monday-Friday, 9:00-17:00 CET</li>
							</ul>
						</div>
					</motion.div>
				</div>
			</motion.div>
		</div>
	)
}