"use client";

import { LANGUAGES, type LanguageCode } from "@/lib/i18n/config";
import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = "" }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = i18n.language as LanguageCode;

  const changeLanguage = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
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
                type="button"
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
