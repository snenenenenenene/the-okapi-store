import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://theokapistore.com";
const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
	try {
		// Use your existing API route instead of calling Printful directly
		const response = await fetch(`${BASE_URL}/api/printful/products/${params.id}`);

		if (!response.ok) {
			return {
				title: "Product Not Found | The Okapi Store",
				description: "Sorry, we couldn't find the product you're looking for.",
			};
		}

		const product = await response.json();
		const mainImage = product.variants[0]?.previewUrl || product.thumbnail_url || product.image;

		return {
			title: `${product.name} | The Okapi Store`,
			description: product.description || 'A unique piece from The Okapi Store',
			// openGraph: {
			// 	title: `${product.name} | The Okapi Store`,
			// 	description: product.description || 'A unique piece from The Okapi Store',
			// 	url: `${BASE_URL}/products/${params.id}`,
			// 	images: [
			// 		{
			// 			url: mainImage,
			// 			width: 800,
			// 			height: 600,
			// 			alt: product.name,
			// 		},
			// 	],
			// 	type: 'product',
			// },
			twitter: {
				card: "summary_large_image",
				title: `${product.name} | The Okapi Store`,
				description: product.description || 'A unique piece from The Okapi Store',
				images: [mainImage],
			},
			alternates: {
				canonical: `${BASE_URL}/products/${params.id}`,
			},
		};
	} catch (error) {
		console.error('Error generating metadata:', error);
		return {
			title: "Product | The Okapi Store",
			description: "Discover unique Okapi-themed apparel.",
		};
	}
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
	return children;
}