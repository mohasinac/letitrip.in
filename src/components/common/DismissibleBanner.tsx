"use client";

/**
 * Dismissible Advertisement Banner
 *
 * Client component that wraps AdvertisementBanner with cookie-based dismissal state.
 * Once dismissed, the banner won't show again until the cookie expires (default 7 days).
 */

import { COOKIE_NAMES, getCookie, setCookie } from "@/lib/cookies";
import { AdvertisementBanner, ClientLink } from "@mohasinac/react-library";
import { useEffect, useState } from "react";

interface DismissibleBannerProps {
  content: string;
  ctaText?: string;
  ctaHref?: string;
  backgroundColor?: string;
  cookieName?: string;
  cookieExpireDays?: number;
}

export function DismissibleBanner({
  content,
  ctaText,
  ctaHref,
  backgroundColor = "#3b82f6",
  cookieName = COOKIE_NAMES.BANNER_DISMISSED,
  cookieExpireDays = 7,
}: DismissibleBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed
    const isDismissed = getCookie(cookieName);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, [cookieName]);

  const handleDismiss = () => {
    setIsVisible(false);
    setCookie(cookieName, "true", { expires: cookieExpireDays });
  };

  if (!isVisible) return null;

  return (
    <AdvertisementBanner
      LinkComponent={ClientLink}
      content={content}
      ctaText={ctaText}
      ctaHref={ctaHref}
      isDismissible={true}
      onDismiss={handleDismiss}
      backgroundColor={backgroundColor}
    />
  );
}
