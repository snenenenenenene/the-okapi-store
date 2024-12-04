/* eslint-disable @typescript-eslint/no-explicit-any */
// app/components/analytics/analytics-provider.tsx
'use client';

import { getCookiePreferences } from '@/utils/cookieManager';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

declare global {
	interface Window {
		gtag: (...args: any[]) => void;
		fbq: (...args: any[]) => void;
	}
}

export default function AnalyticsProvider() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const cookiePreferences = getCookiePreferences();

	// Track page views
	useEffect(() => {
		if (cookiePreferences.analytics) {
			// Google Analytics pageview
			window.gtag('event', 'page_view', {
				page_title: document.title,
				page_location: window.location.href,
				page_path: pathname,
			});

			// Meta Pixel pageview
			window.fbq('track', 'PageView');
		}
	}, [pathname, searchParams, cookiePreferences.analytics]);

	if (!cookiePreferences.analytics) {
		return null;
	}

	return (
		<>
			{/* Google Analytics */}
			<Script
				strategy="afterInteractive"
				src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
			/>
			<Script
				id="google-analytics"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
				}}
			/>

			{/* Meta Pixel */}
			<Script
				id="meta-pixel"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
				}}
			/>
		</>
	);
}