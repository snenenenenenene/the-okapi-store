import { type SiteConfig } from '@/types/site'

export const siteConfig: SiteConfig = {
  name: "The Okapi Store",
  description: "Discover unique, high-quality products with a touch of elegance.",
  
  // Branding
  branding: {
    logo: "/images/okapi-logo.png",
    favicon: "/favicon.ico",
    theme: {
      primary: "#059669", // Emerald-600
      secondary: "#0891b2", // Cyan-600
      accent: "#8b5cf6", // Violet-500
      neutral: "#1f2937", // Gray-800
      "base-100": "#ffffff",
      "base-200": "#f3f4f6",
      "base-300": "#d1d5db",
      "base-content": "#111827",
    },
    fonts: {
      sans: "Inter",
      serif: "Merriweather",
      mono: "JetBrains Mono",
    },
  },

  // Features
  features: {
    auth: {
      enabled: true,
      providers: ["google", "github"],
      requireEmailVerification: true,
    },
    orders: {
      requireDraftApproval: true,
      automaticFulfillment: true,
      defaultStatus: "draft",
      statuses: ["draft", "pending", "processing", "shipped", "delivered", "cancelled"],
      allowedCountries: ["BE", "NL", "LU", "DE", "FR"],
    },
    products: {
      showOutOfStock: false,
      enableWishlist: true,
      enableComparisons: true,
      reviewsEnabled: true,
      ratingsEnabled: true,
    },
    cart: {
      persistCart: true,
      showTaxes: true,
      showShipping: true,
      minimumOrderAmount: 0,
      maximumOrderAmount: 10000,
    },
    newsletter: {
      enabled: true,
      doubleOptIn: true,
      provider: "mailchimp",
    },
  },

  // Analytics & Marketing
  analytics: {
    googleAnalytics: {
      enabled: true,
      anonymizeIp: true,
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    },
    facebookPixel: {
      enabled: true,
      pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
    },
  },

  // Social Media
  social: {
    twitter: "https://twitter.com/okapistore",
    facebook: "https://facebook.com/okapistore",
    instagram: "https://instagram.com/okapistore",
    pinterest: "https://pinterest.com/okapistore",
  },

  // SEO & Meta
  seo: {
    titleTemplate: "%s | The Okapi Store",
    defaultTitle: "The Okapi Store - Unique Products with Elegance",
    defaultDescription: "Discover our collection of unique, high-quality products crafted with elegance and style.",
    siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://okapi-store.com",
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "The Okapi Store",
    },
    twitter: {
      handle: "@okapistore",
      site: "@okapistore",
      cardType: "summary_large_image",
    },
  },

  // Contact & Support
  contact: {
    email: "support@okapi-store.com",
    phone: "+1 (555) 123-4567",
    address: {
      street: "123 Okapi Street",
      city: "Amsterdam",
      state: "NH",
      zip: "1012 AB",
      country: "Netherlands",
    },
  },

  // Legal
  legal: {
    companyName: "Okapi Store B.V.",
    vatNumber: "NL123456789B01",
    chamberOfCommerce: "12345678",
    privacyPolicy: "/legal/privacy",
    termsOfService: "/legal/terms",
    returnPolicy: "/legal/returns",
    cookiePolicy: "/legal/cookies",
  },
}
