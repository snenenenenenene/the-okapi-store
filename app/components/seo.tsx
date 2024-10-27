// app/components/Seo.tsx
import Head from 'next/head'

interface SeoProps {
	title: string
	description: string
	image?: string
	url?: string
	type?: string
}

export function Seo({
	title,
	description,
	image = '/images/default-og.jpg',
	url = process.env.NEXT_PUBLIC_BASE_URL,
	type = 'website'
}: SeoProps) {
	const fullTitle = `${title} | The Okapi Store`

	return (
		<Head>
			{/* Basic Meta Tags */}
			<title>{fullTitle}</title>
			<meta name="description" content={description} />

			{/* Open Graph Meta Tags */}
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={image} />
			<meta property="og:url" content={url} />
			<meta property="og:type" content={type} />

			{/* Twitter Meta Tags */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={image} />
		</Head>
	)
}
