"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { BannerAlert } from "@/components/ui/unified";
import {
  PrimaryButton,
  OutlineButton,
  IconButton,
} from "@/components/ui/unified";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has given consent via cookie
    const checkConsent = () => {
      if (typeof window !== "undefined") {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split("=");
          if (name === "cookieConsent") {
            return value !== undefined;
          }
        }
      }
      return false;
    };

    if (!checkConsent()) {
      setShowBanner(true);
    }
  }, []);

  const setCookie = (name: string, value: string, days: number = 365) => {
    if (typeof window !== "undefined") {
      const expires = new Date();
      expires.setDate(expires.getDate() + days);
      document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    }
  };

  const handleAccept = () => {
    setCookie("cookieConsent", "true", 365);
    setCookie("cookieConsentDate", new Date().toISOString(), 365);
    setCookie("analyticsStorage", "granted", 365);
    setShowBanner(false);

    // Optional: Send analytics event
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const handleDecline = () => {
    setCookie("cookieConsent", "false", 365);
    setCookie("cookieConsentDate", new Date().toISOString(), 365);
    setCookie("analyticsStorage", "denied", 365);
    setShowBanner(false);

    // Optional: Send analytics event
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
  };

  if (!showBanner) return null;

  return (
    <BannerAlert
      variant="default"
      filled
      position="bottom"
      fullWidth
      showIcon={false}
      title="🍪 Cookie Consent"
      onClose={() => setShowBanner(false)}
      className="py-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm flex-1">
          We use cookies to enhance your browsing experience, remember your
          preferences, and analyze our traffic. These cookies do not store
          personal authentication data. By clicking "Accept", you agree to the
          use of cookies for analytics and preferences.
          <a href="/cookies" className="hover:underline ml-1 font-medium">
            Learn more
          </a>
        </p>

        <div className="flex items-center gap-3 flex-shrink-0">
          <OutlineButton size="sm" onClick={handleDecline}>
            Decline
          </OutlineButton>
          <PrimaryButton size="sm" onClick={handleAccept}>
            Accept
          </PrimaryButton>
        </div>
      </div>
    </BannerAlert>
  );
}
