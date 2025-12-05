/**
 * @fileoverview React Component
 * @module src/components/common/LanguageSelector
 * @description This file contains the LanguageSelector component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { LANGUAGES, type LanguageCode } from "@/lib/i18n/config";
import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * LanguageSelectorProps interface
 * 
 * @interface
 * @description Defines the structure and contract for LanguageSelectorProps
 */
interface LanguageSelectorProps {
  /** Class Name */
  className?: string;
}

/**
 * Function: Language Selector
 */
/**
 * Performs language selector operation
 *
 * @param {LanguageSelectorProps} [{ className] - Name of { class
 *
 * @returns {any} The languageselector result
 *
 * @example
 * LanguageSelector({ className);
 */

/**
 * Performs language selector operation
 *
 * @param {LanguageSelectorProps} [{ className] - Name of { class
 *
 * @returns {any} The languageselector result
 *
 * @example
 * LanguageSelector({ className);
 */

export function LanguageSelector({ className = "" }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = i18n.language as LanguageCode;

  /**
   * Performs change language operation
   *
   * @param {LanguageCode} langCode - The lang code
   *
   * @returns {any} The changelanguage result
   */

  /**
   * Performs change language operation
   *
   * @param {LanguageCode} langCode - The lang code
   *
   * @returns {any} The changelanguage result
   */

  const changeLanguage = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    /**
     * Handles click outside event
     *
     * @param {MouseEvent} event - The event
     *
     * @returns {any} The handleclickoutside result
     */

    /**
     * Handles click outside event
     *
     * @param {MouseEvent} event - The event
     *
     * @returns {any} The handleclickoutside result
     */

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {LANGUAGES[currentLanguage]?.nativeName || "English"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-2">
            {(
              Object.entries(LANGUAGES) as [
                LanguageCode,
                (typeof LANGUAGES)[LanguageCode]
              ][]
            ).map(([code, { name, nativeName }]) => (
              <button
                key={code}
                onClick={() => changeLanguage(code)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  currentLanguage === code
                    ? "text-yellow-600 dark:text-yellow-500 font-medium"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{nativeName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {name}
                  </span>
                </div>
                {currentLanguage === code && (
                  <Check className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
