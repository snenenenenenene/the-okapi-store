import Head from 'next/head';
import React from 'react';
import { jsonLdScriptProps } from 'react-schemaorg';

interface SeoProps {
	title: string;
	description: string;
	image?: string;
	url?: string;
	type?: string;
	noindex?: boolean;
	canonical?: string;
	openGraph?: {
		title?: string;
		description?: string;
		images?: Array<{ url: string; alt: string }>;
	};
	twitter?: {
		card?: string;
		site?: string;
		creator?: string;
	};
}

export function SEO({
	title,
	description,
	image = '/images/default-og.jpg',
	url = process.env.NEXT_PUBLIC_BASE_URL,
	type = 'website',
	noindex = false,
	canonical,
	openGraph,
	twitter
}: SeoProps) {
	const fullTitle = `${title} | The Okapi Store`;

	return (
		<Head>
			{/* Basic Meta Tags */}
			<title>{fullTitle}</title>
			<meta name="description" content={description} />
			{noindex && <meta name="robots" content="noindex,nofollow" />}
			{canonical && <link rel="canonical" href={canonical} />}

			{/* OpenGraph Meta Tags */}
			<meta property="og:title" content={openGraph?.title || fullTitle} />
			<meta property="og:description" content={openGraph?.description || description} />
			<meta property="og:type" content={type} />
			<meta property="og:url" content={url} />
			{openGraph?.images?.map((img, index) => (
				<React.Fragment key={index}>
					<meta property="og:image" content={img.url} />
					<meta property="og:image:alt" content={img.alt} />
				</React.Fragment>
			))}

			{/* Twitter Meta Tags */}
			<meta name="twitter:card" content={twitter?.card || "summary_large_image"} />
			<meta name="twitter:site" content={twitter?.site || "@okapistore"} />
			<meta name="twitter:creator" content={twitter?.creator || "@sennebels"} />
			<meta name="twitter:title" content={fullTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={image} />

			{/* Other Important Meta Tags */}
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<link rel="icon" href="/favicon.ico" />
			<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
			<meta name="theme-color" content="#8D6E63" />
		</Head>
	);
}

interface WebsiteSchemaProps {
	siteUrl: string;
}

export function WebsiteSchema({ siteUrl }: WebsiteSchemaProps) {
	return (
		<script
			{...jsonLdScriptProps({
				"@context": "https://schema.org",
				"@type": "WebSite",
				name: "The Okapi Store",
				url: siteUrl,
				potentialAction: {
					"@type": "SearchAction",
					target: `${siteUrl}/search?q={search_term_string}`,
					"query-input": "required name=search_term_string"
				}
			})}
		/>
	);
}

interface ProductSchemaProps {
	product: {
		id: string;
		name: string;
		description: string;
		price: number;
		image: string;
		currency?: string;
		sku?: string;
		inStock?: boolean;
	};
	siteUrl: string;
}

export function ProductSchema({ product, siteUrl }: ProductSchemaProps) {
	return (
		<script
			{...jsonLdScriptProps({
				"@context": "https://schema.org",
				"@type": "Product",
				name: product.name,
				description: product.description,
				image: product.image,
				sku: product.sku || product.id,
				offers: {
					"@type": "Offer",
					price: product.price,
					priceCurrency: product.currency || "EUR",
					availability: product.inStock
						? "https://schema.org/InStock"
						: "https://schema.org/OutOfStock",
					url: `${siteUrl}/products/${product.id}`
				},
				brand: {
					"@type": "Brand",
					name: "The Okapi Store"
				}
			})}
		/>
	);
}

interface OrganizationSchemaProps {
	siteUrl: string;
}

export function OrganizationSchema({ siteUrl }: OrganizationSchemaProps) {
	return (
		<script
			{...jsonLdScriptProps({
				"@context": "https://schema.org",
				"@type": "Organization",
				name: "The Okapi Store",
				url: siteUrl,
				logo: `${siteUrl}/images/okapi-logo.png`,
				sameAs: [
					"https://twitter.com/okapistore",
					"https://instagram.com/okapistore",
					"https://facebook.com/okapistore"
				],
				contactPoint: {
					"@type": "ContactPoint",
					telephone: "+32-470-976-709",
					contactType: "customer service",
					email: "okapistore@gmail.com",
					availableLanguage: ["English", "Dutch"]
				}
			})}
		/>
	);
}