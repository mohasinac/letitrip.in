"use client";

import { useEffect } from "react";
import {
  registerAdSlots,
  setAdConsentGranted,
  type AdSlotConfig,
} from "@mohasinac/appkit/client";

const AD_CONSENT_STORAGE_KEY = "letitrip.adConsentGranted";

function readAdConsentFromStorage(): boolean | null {
  try {
    const value = localStorage.getItem(AD_CONSENT_STORAGE_KEY);
    if (value === "true") return true;
    if (value === "false") return false;
  } catch {
    // Ignore storage access errors.
  }
  return null;
}

function readAdConsentFromCookies(): boolean | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie;
  const acceptedPatterns = [
    /(?:^|;\s*)cookie_consent=accepted(?:;|$)/i,
    /(?:^|;\s*)cookie-consent=accepted(?:;|$)/i,
    /(?:^|;\s*)cookieConsent=true(?:;|$)/i,
    /(?:^|;\s*)ad_consent=true(?:;|$)/i,
  ];

  if (acceptedPatterns.some((pattern) => pattern.test(cookie))) {
    return true;
  }
  return null;
}

function resolveInitialConsent(): boolean {
  const storage = readAdConsentFromStorage();
  if (storage !== null) return storage;

  const cookie = readAdConsentFromCookies();
  if (cookie !== null) return cookie;

  return false;
}

const AD_SLOT_CONFIGS: AdSlotConfig[] = [
  { id: "homepage-hero-banner", provider: "manual", reservedHeight: 90, requiresConsent: true },
  { id: "homepage-mid-banner", provider: "manual", reservedHeight: 90, requiresConsent: true },
  { id: "homepage-bottom-banner", provider: "manual", reservedHeight: 90, requiresConsent: true },
  { id: "listing-sidebar-top", provider: "manual", reservedHeight: 90, requiresConsent: true },
  { id: "listing-sidebar-bottom", provider: "manual", reservedHeight: 90, requiresConsent: true },
  { id: "listing-between-rows", provider: "manual", reservedHeight: 90, requiresConsent: true },
  { id: "detail-below-gallery", provider: "manual", reservedHeight: 90, requiresConsent: true },
  { id: "detail-below-price", provider: "manual", reservedHeight: 90, requiresConsent: true },
  { id: "cart-upsell", provider: "manual", reservedHeight: 90, requiresConsent: true },
  { id: "checkout-upsell", provider: "manual", reservedHeight: 90, requiresConsent: true },
  { id: "search-inline", provider: "manual", reservedHeight: 90, requiresConsent: true },
];

/**
 * Initializes ad slot registry and consent gate for client-rendered AdSlot usage.
 * Consumers can update consent at runtime via:
 * window.dispatchEvent(new CustomEvent("letitrip:ad-consent", { detail: { granted: true } }))
 */
export function AdRuntimeInitializer() {
  useEffect(() => {
    registerAdSlots(AD_SLOT_CONFIGS);
    setAdConsentGranted(resolveInitialConsent());

    const onAdConsentChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ granted?: boolean }>;
      const granted = Boolean(customEvent.detail?.granted);
      try {
        localStorage.setItem(AD_CONSENT_STORAGE_KEY, String(granted));
      } catch {
        // Ignore storage write errors.
      }
      setAdConsentGranted(granted);
    };

    window.addEventListener("letitrip:ad-consent", onAdConsentChanged as EventListener);
    return () => {
      window.removeEventListener("letitrip:ad-consent", onAdConsentChanged as EventListener);
    };
  }, []);

  return null;
}
