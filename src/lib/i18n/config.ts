/**
 * i18next Configuration
 *
 * Internationalization setup for multi-language support
 * Supports: English (India), Hindi, Tamil, Telugu
 */

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Import translations
import enIN from "./translations/en-IN.json";
import hi from "./translations/hi.json";
import ta from "./translations/ta.json";
import te from "./translations/te.json";

// Available languages
export const LANGUAGES = {
  "en-IN": { name: "English", nativeName: "English" },
  hi: { name: "Hindi", nativeName: "हिन्दी" },
  ta: { name: "Tamil", nativeName: "தமிழ்" },
  te: { name: "Telugu", nativeName: "తెలుగు" },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// Initialize i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources: {
      "en-IN": { translation: enIN },
      hi: { translation: hi },
      ta: { translation: ta },
      te: { translation: te },
    },
    fallbackLng: "en-IN",
    defaultNS: "translation",
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Detection order
      order: ["localStorage", "cookie", "navigator", "htmlTag"],
      // Cache user language
      caches: ["localStorage", "cookie"],
      lookupLocalStorage: "i18nextLng",
      lookupCookie: "i18next",
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
