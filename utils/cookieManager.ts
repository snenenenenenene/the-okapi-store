// utils/cookieManager.ts

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const COOKIE_CONSENT_KEY = "cookie-consent";

export const getCookiePreferences = (): CookiePreferences => {
  if (typeof window === "undefined") {
    return {
      necessary: true,
      analytics: false,
      marketing: false,
    };
  }

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    return stored
      ? JSON.parse(stored)
      : {
          necessary: true,
          analytics: false,
          marketing: false,
        };
  } catch (error) {
    console.error("Error reading cookie preferences:", error);
    return {
      necessary: true,
      analytics: false,
      marketing: false,
    };
  }
};

export const saveCookiePreferences = (preferences: CookiePreferences): void => {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
    applyPreferences(preferences);
  } catch (error) {
    console.error("Error saving cookie preferences:", error);
  }
};

export const applyPreferences = (preferences: CookiePreferences): void => {
  // Apply analytics preferences
  if (preferences.analytics) {
    enableAnalytics();
  } else {
    disableAnalytics();
  }

  // Apply marketing preferences
  if (preferences.marketing) {
    enableMarketing();
  } else {
    disableMarketing();
  }
};

// Helper functions for analytics
const enableAnalytics = () => {
  // Enable Google Analytics
  if (typeof window !== "undefined" && window.gtag) {
    (window as any).gtag("consent", "update", {
      analytics_storage: "granted",
    });
  }
};

const disableAnalytics = () => {
  // Disable Google Analytics
  if (typeof window !== "undefined" && window.gtag) {
    (window as any).gtag("consent", "update", {
      analytics_storage: "denied",
    });
  }
};

// Helper functions for marketing
const enableMarketing = () => {
  // Enable marketing cookies (e.g., Meta Pixel)
  if (typeof window !== "undefined" && window.fbq) {
    (window as any).fbq("consent", "grant");
  }
};

const disableMarketing = () => {
  // Disable marketing cookies
  if (typeof window !== "undefined" && window.fbq) {
    (window as any).fbq("consent", "revoke");
  }
};

// Function to check if consent is needed
export const isConsentNeeded = (): boolean => {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(COOKIE_CONSENT_KEY);
};

// Function to reset consent
export const resetConsent = (): void => {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
};
