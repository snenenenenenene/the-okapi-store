/* eslint-disable @typescript-eslint/no-explicit-any */
export function ProductJsonLd({ product }: { product: any }) {
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.name,
		description: product.description,
		image: product.image,
		offers: {
			'@type': 'Offer',
			price: product.price,
			priceCurrency: 'EUR',
			availability: product.inStock
				? 'https://schema.org/InStock'
				: 'https://schema.org/OutOfStock',
		},
		brand: {
			'@type': 'Brand',
			name: 'The Okapi Store',
		},
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	)
}