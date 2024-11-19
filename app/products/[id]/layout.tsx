// app/products/[id]/layout.tsx
import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://theokapistore.com";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
	// Fetch product data dynamically
	const response = await fetch(`${BASE_URL}/api/printful/products/${params.id}`);
	if (!response.ok) {
		return {
			title: "Product Not Found | The Okapi Store",
			description: "Sorry, we couldn't find the product you're looking for.",
		};
	}

	const product = await response.json();

	return {
		title: `${product.name} | The Okapi Store`,
		description: product.description,
		openGraph: {
			title: `${product.name} | The Okapi Store`,
			description: product.description,
			url: `${BASE_URL}/products/${params.id}`,
			images: [
				{
					url: product.variants[0]?.previewUrl || product.image,
					width: 800,
					height: 600,
					alt: product.name,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `${product.name} | The Okapi Store`,
			description: product.description,
			images: [product.variants[0]?.previewUrl || product.image],
		},
	};
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{children}
		</>
	);
}
