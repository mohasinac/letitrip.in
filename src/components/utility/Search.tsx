"use client";

import { useState, useRef, useEffect } from "react";
import { THEME_CONSTANTS } from "@/constants";
import { Text } from "@/components";
import Button from "../ui/Button";

/**
 * Search Component
 *
 * Two modes:
 *
 * **Overlay mode** (default): A sticky search bar that slides in below the
 * title bar. Features auto-focus, ESC key support, and Enter key submission.
 *
 * **Inline mode**: A controlled search input for filter toolbars and list
 * pages. Activated by passing `value` + `onChange`. Calls `onChange` after
 * `debounceMs` (default 300 ms) to avoid API calls on every keystroke.
 *
 * @component
 * @example Overlay mode
 * ```tsx
 * <Search
 *   isOpen={searchOpen}
 *   onClose={() => setSearchOpen(false)}
 *   onSearch={(query) => handleSearch(query)}
 * />
 * ```
 * @example Inline mode (use with useUrlTable)
 * ```tsx
 * import { searchService } from '@/services';
 * <Search
 *   value={table.get("q")}
 *   onChange={(v) => table.set("q", v)}
 *   placeholder={UI_PLACEHOLDERS.SEARCH}
 *   onClear={() => table.set("q", "")}
 * />
 * ```
 */

interface SearchProps {
  // ── Overlay mode ────────────────────────────────────────────────────────────
  isOpen?: boolean;
  onClose?: () => void;
  onSearch?: (query: string) => void;
  // ── Inline mode (activated when `value` is provided) ────────────────────────
  /** Controlled value from `useUrlTable`. Providing this enables inline mode. */
  value?: string;
  /** Called with debounce after the user types. Write back via `table.set("q", v)`. */
  onChange?: (v: string) => void;
  placeholder?: string;
  /** Debounce delay in ms. Default: `300`. */
  debounceMs?: number;
  /** Called after the clear button is pressed (in addition to `onChange("")`). */
  onClear?: () => void;
  className?: string;
}

export default function Search({
  isOpen,
  onClose,
  onSearch,
  value,
  onChange,
  placeholder,
  debounceMs = 300,
  onClear,
  className,
}: SearchProps) {
  const isInlineMode = value !== undefined;

  // ── Shared state ────────────────────────────────────────────────────────────
  const [query, setQuery] = useState(isInlineMode ? value : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Overlay: auto-focus ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isInlineMode && isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isInlineMode]);

  // ── Overlay: ESC to close ────────────────────────────────────────────────────
  useEffect(() => {
    if (isInlineMode) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose, isInlineMode]);

  // ── Inline: sync external value → internal query (e.g. cleared from outside) ─
  useEffect(() => {
    if (isInlineMode) setQuery(value ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ── Inline: debounced onChange ───────────────────────────────────────────────
  const handleInlineChange = (v: string) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange?.(v), debounceMs);
  };

  // ── Overlay handlers ─────────────────────────────────────────────────────────
  const handleOverlaySearch = () => {
    if (query.trim() && onSearch) onSearch(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!isInlineMode && e.key === "Enter") handleOverlaySearch();
  };

  // ── INLINE RENDER ────────────────────────────────────────────────────────────
  if (isInlineMode) {
    return (
      <div className={`relative flex items-center ${className ?? ""}`}>
        <svg
          className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleInlineChange(e.target.value)}
          placeholder={placeholder}
          className={`${THEME_CONSTANTS.input.base} ${THEME_CONSTANTS.themed.bgInput} ${THEME_CONSTANTS.themed.border} ${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.placeholder} ${THEME_CONSTANTS.themed.focusRing} w-full pl-9${query ? " pr-9" : ""}`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange?.("");
              onClear?.();
            }}
            className="absolute right-3 p-0.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="w-4 h-4"
              aria-hidden="true"
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
        )}
      </div>
    );
  }

  // ── OVERLAY RENDER ───────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <>
      {/* Search Bar - sticky positioning after TitleBar */}
      {/* Appears after TitleBar on both mobile and desktop (navbar hides on scroll) */}
      <div
        className={`sticky top-20 ${THEME_CONSTANTS.zIndex.search} ${THEME_CONSTANTS.layout.titleBarBg} border-b ${THEME_CONSTANTS.themed.border} shadow-md animate-slide-down`}
      >
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="search"
                placeholder="Search products, categories, sellers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`${THEME_CONSTANTS.input.base} ${THEME_CONSTANTS.themed.bgInput} ${THEME_CONSTANTS.themed.border} ${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.placeholder} ${THEME_CONSTANTS.themed.focusRing} w-full`}
              />
            </div>

            {/* Search Button */}
            <Button
              onClick={handleOverlaySearch}
              variant="primary"
              size="md"
              className="hidden sm:flex gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </Button>

            {/* Close Button */}
            <button
              onClick={() => onClose?.()}
              className={`p-2.5 md:p-3 rounded-xl transition-colors ${THEME_CONSTANTS.colors.iconButton.onLight} flex-shrink-0`}
              aria-label="Close search"
            >
              <svg
                className={`w-6 h-6 md:w-7 md:h-7 ${THEME_CONSTANTS.colors.icon.titleBar}`}
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

          {/* Search Results Preview */}
          {query && (
            <div
              className={`mt-4 ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.themed.border} rounded-xl p-4 max-h-96 overflow-y-auto`}
            >
              <Text variant="secondary" size="sm">
                Searching for "{query}"...
              </Text>
              {/* Add your search results here */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
