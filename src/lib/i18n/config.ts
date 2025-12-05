/**
 * @fileoverview Configuration
 * @module src/lib/i18n/config
 * @description This file contains functionality related to config
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
/**
 * Languages
 * @constant
 */
export const LANGUAGES = {
  "en-IN": { name: "English", nativeName: "English" },
  /** Hi */
  hi: { name: "Hindi", nativeName: "हिन्दी" },
  /** Ta */
  ta: { name: "Tamil", nativeName: "தமிழ்" },
  /** Te */
  te: { name: "Telugu", nativeName: "తెలుగు" },
} as const;

/**
 * LanguageCode type
 * 
 * @typedef {Object} LanguageCode
 * @description Type definition for LanguageCode
 */
/**
 * LanguageCode type definition
 *
 * @typedef {keyof typeof LANGUAGES} LanguageCode
 * @description Type definition for LanguageCode
 */
export type LanguageCode = keyof typeof LANGUAGES;

// Initialize i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    /** Resources */
    resources: {
      "en-IN": { translation: enIN },
      /** Hi */
      hi: { translation: hi },
      /** Ta */
      ta: { translation: ta },
      /** Te */
      te: { translation: te },
    },
    /** Fallback Lng */
    fallbackLng: "en-IN",
    /** Default N S */
    defaultNS: "translation",
    /** Debug */
    debug: process.env.NODE_ENV === "development",

    /** Interpolation */
    interpolation: {
      /** EscapeValue */
      escapeValue: false, // React already escapes values
    },

    /** Detection */
    detection: {
      // Detection order
      /** Order */
      order: ["localStorage", "cookie", "navigator", "htmlTag"],
      // Cache user language
      /** Caches */
      caches: ["localStorage", "cookie"],
      /** Lookup Local Storage */
      lookupLocalStorage: "i18nextLng",
      /** Lookup Cookie */
      lookupCookie: "i18next",
    },

    /** React */
    react: {
      /** Use Suspense */
      useSuspense: false,
    },
  });

export default i18n;
