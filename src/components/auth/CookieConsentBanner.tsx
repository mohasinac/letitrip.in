"use client";

import React, { useState, useEffect } from "react";
import {
  StorageManager,
  CookieConsentSettings,
} from "@/lib/storage/cookieConsent";

interface CookieConsentBannerProps {
  onConsentGiven?: (settings: CookieConsentSettings) => void;
}

export default function CookieConsentBanner({
  onConsentGiven,
}: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState<CookieConsentSettings>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Only show if localStorage is not available and consent not given
    if (StorageManager.isCookieConsentRequired()) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookieConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };

    StorageManager.setCookieConsent(allAccepted);
    setIsVisible(false);
    onConsentGiven?.(allAccepted);
  };

  const handleAcceptSelected = () => {
    StorageManager.setCookieConsent(settings);
    setIsVisible(false);
    onConsentGiven?.(settings);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookieConsentSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };

    StorageManager.setCookieConsent(onlyNecessary);
    setIsVisible(false);
    onConsentGiven?.(onlyNecessary);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        {!showDetails ? (
          // Simple banner
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We Value Your Privacy
              </h3>
              <p className="text-sm text-gray-600">
                Your browser doesn't support local storage. We need your consent
                to use cookies to store your preferences and provide you with
                the best experience. You can customize your preferences or
                accept all cookies.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                Customize
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Detailed settings
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid gap-4 max-h-60 overflow-y-auto">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      Necessary Cookies
                    </h4>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Required
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Essential for the website to function properly. These
                    cookies enable basic features like authentication and cannot
                    be disabled.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Preferences Cookies */}
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Preference Cookies
                  </h4>
                  <p className="text-sm text-gray-600">
                    Remember your settings and preferences to provide a
                    personalized experience, including language preferences and
                    user interface customizations.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={settings.preferences}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        preferences: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Analytics Cookies
                  </h4>
                  <p className="text-sm text-gray-600">
                    Help us understand how visitors interact with our website by
                    collecting and reporting information anonymously.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={settings.analytics}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        analytics: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Marketing Cookies
                  </h4>
                  <p className="text-sm text-gray-600">
                    Used to track visitors across websites to display relevant
                    advertisements and measure the effectiveness of advertising
                    campaigns.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={settings.marketing}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        marketing: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptSelected}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
