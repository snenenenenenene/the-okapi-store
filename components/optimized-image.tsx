// components/optimized-image.tsx
'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
	src: string;
	alt: string;
	className?: string;
	width?: number;
	height?: number;
	priority?: boolean;
	sizes?: string;
}

export function OptimizedImage({
	src,
	alt,
	className = '',
	width,
	height,
	priority = false,
	sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
	const [isLoading, setIsLoading] = useState(true);

	return (
		<div className="relative">
			{isLoading && (
				<div className="absolute inset-0 flex items-center justify-center bg-base-200">
					<Loader2 className="w-6 h-6 animate-spin text-primary" />
				</div>
			)}
			<Image
				src={src}
				alt={alt}
				width={width}
				height={height}
				className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
				onLoad={() => setIsLoading(false)}
				priority={priority}
				sizes={sizes}
				quality={90}
				loading={priority ? 'eager' : 'lazy'}
			/>
		</div>
	);
}