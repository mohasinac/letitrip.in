/**
 * LanguageSelector Component
 *
 * A framework-agnostic language selector dropdown component.
 * Displays language options with native names and allows selection.
 *
 * @example
 * ```tsx
 * <LanguageSelector
 *   value="en"
 *   onChange={(code) => i18n.changeLanguage(code)}
 *   languages={LANGUAGES}
 * />
 * ```
 */

import React, { useEffect, useRef, useState } from "react";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface LanguageSelectorProps {
  /** Currently selected language code */
  value: string;
  /** Callback when language changes */
  onChange: (languageCode: string) => void;
  /** Available languages */
  languages: Record<string, Omit<Language, "code">>;
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom globe icon component */
  GlobeIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom check icon component */
  CheckIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Default Globe Icon
const DefaultGlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

// Default Check Icon
const DefaultCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function LanguageSelector({
  value,
  onChange,
  languages,
  label,
  disabled = false,
  className = "",
  GlobeIcon = DefaultGlobeIcon,
  CheckIcon = DefaultCheckIcon,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages[value];

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg 
          transition-colors
          ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        `}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <GlobeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguage?.nativeName || "Select Language"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-2">
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={`
                  w-full flex items-center justify-between px-4 py-2 text-sm 
                  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                  ${
                    value === code
                      ? "text-yellow-600 dark:text-yellow-500 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }
                `}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {lang.name}
                  </span>
                </div>
                {value === code && (
                  <CheckIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
