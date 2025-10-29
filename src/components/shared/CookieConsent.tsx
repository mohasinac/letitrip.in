"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🍪 Cookie Consent
            </h3>
            <p className="text-sm text-gray-600">
              We use cookies to enhance your browsing experience, remember your
              preferences, and analyze our traffic. These cookies do not store
              personal authentication data. By clicking "Accept", you agree to
              the use of cookies for analytics and preferences.
              <a href="/cookies" className="text-primary hover:underline ml-1">
                Learn more
              </a>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
