export interface SiteConfig {
  name: string
  description: string
  branding: {
    logo: string
    favicon: string
    theme: {
      primary: string
      secondary: string
      accent: string
      neutral: string
      "base-100": string
      "base-200": string
      "base-300": string
      "base-content": string
    }
    fonts: {
      sans: string
      serif: string
      mono: string
    }
  }
  features: {
    auth: {
      enabled: boolean
      providers: string[]
      requireEmailVerification: boolean
    }
    orders: {
      requireDraftApproval: boolean
      automaticFulfillment: boolean
      defaultStatus: string
      statuses: string[]
      allowedCountries: string[]
    }
    products: {
      showOutOfStock: boolean
      enableWishlist: boolean
      enableComparisons: boolean
      reviewsEnabled: boolean
      ratingsEnabled: boolean
    }
    cart: {
      persistCart: boolean
      showTaxes: boolean
      showShipping: boolean
      minimumOrderAmount: number
      maximumOrderAmount: number
    }
    newsletter: {
      enabled: boolean
      doubleOptIn: boolean
      provider: string
    }
  }
  analytics: {
    googleAnalytics: {
      enabled: boolean
      anonymizeIp: boolean
      measurementId: string | undefined
    }
    facebookPixel: {
      enabled: boolean
      pixelId: string | undefined
    }
  }
  social: {
    twitter: string
    facebook: string
    instagram: string
    pinterest: string
  }
  seo: {
    titleTemplate: string
    defaultTitle: string
    defaultDescription: string
    siteUrl: string
    openGraph: {
      type: string
      locale: string
      siteName: string
    }
    twitter: {
      handle: string
      site: string
      cardType: string
    }
  }
  contact: {
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
  }
  legal: {
    companyName: string
    vatNumber: string
    chamberOfCommerce: string
    privacyPolicy: string
    termsOfService: string
    returnPolicy: string
    cookiePolicy: string
  }
}
