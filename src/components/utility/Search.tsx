"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { THEME_CONSTANTS } from "@/constants";
import { Li, Text, Ul } from "@/components";
import { useTranslations } from "next-intl";
import Button from "../ui/Button";
import { useNavSuggestions } from "@/hooks";
import type { AlgoliaNavRecord } from "@/hooks";

const NAV_TYPE_ICON: Record<AlgoliaNavRecord["type"], string> = {
  page: "📄",
  category: "🗂️",
  blog: "✍️",
  event: "🎉",
};

const NAV_TYPE_BADGE: Record<AlgoliaNavRecord["type"], string> = {
  page: "bg-zinc-100 text-zinc-600 dark:bg-slate-700 dark:text-zinc-300",
  category: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  blog: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
  event: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
};

/**
 * Search Component
 *
 * Two modes:
 *
 * **Overlay mode** (default): A sticky search bar that slides in below the
 * title bar. Features auto-focus, ESC key support, and Enter key submission.
 *
 * **Inline mode**: A controlled search input for filter toolbars and list
 * pages. Activated by passing `value` + `onChange`.
 *
 * By default the inline mode is **deferred**: `onChange` fires only when the
 * user presses Enter or clicks the search submit button. Pass `deferred={false}`
 * to revert to the legacy live-debounced behaviour (e.g. site-wide SearchView).
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
 * @example Inline deferred mode (listing pages — default)
 * ```tsx
 * <Search
 *   value={table.get("q")}
 *   onChange={(v) => table.set("q", v)}
 *   placeholder={t("searchPlaceholder")}
 * />
 * ```
 * @example Inline live mode (site-wide search page)
 * ```tsx
 * <Search
 *   deferred={false}
 *   value={table.get("q")}
 *   onChange={(v) => table.set("q", v)}
 *   placeholder={t("searchPlaceholder")}
 *   debounceMs={400}
 * />
 * ```
 */

interface SearchProps {
  // ── Overlay mode ────────────────────────────────────────────────────────────
  isOpen?: boolean;
  onClose?: () => void;
  onSearch?: (query: string) => void;
  /** Called when the search overlay should open (used for Cmd+K shortcut). */
  onOpen?: () => void;
  // ── Inline mode (activated when `value` is provided) ────────────────────────
  /** Controlled value from `useUrlTable`. Providing this enables inline mode. */
  value?: string;
  /** Called when the user submits (deferred) or after debounce (live). */
  onChange?: (v: string) => void;
  placeholder?: string;
  /**
   * When `true` (default), `onChange` fires only when the user presses Enter
   * or clicks the search button. Set to `false` for live debounced behaviour.
   */
  deferred?: boolean;
  /** Debounce delay in ms. Only used when `deferred={false}`. Default: `300`. */
  debounceMs?: number;
  /** Called after the clear button is pressed (in addition to `onChange("")`). */
  onClear?: () => void;
  className?: string;
}

export default function Search({
  isOpen,
  onClose,
  onSearch,
  onOpen,
  value,
  onChange,
  placeholder,
  deferred = true,
  debounceMs = 300,
  onClear,
  className,
}: SearchProps) {
  const isInlineMode = value !== undefined;
  const t = useTranslations("search");

  // ── Shared state ────────────────────────────────────────────────────────────
  const [query, setQuery] = useState(isInlineMode ? value : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Global Cmd+K / Ctrl+K to open overlay ────────────────────────────────
  useEffect(() => {
    if (isInlineMode || !onOpen) return;
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    document.addEventListener("keydown", handleCmdK);
    return () => document.removeEventListener("keydown", handleCmdK);
  }, [isInlineMode, onOpen]);

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

  // ── Inline: debounced onChange (live mode only) ─────────────────────────────
  const handleInlineChange = (v: string) => {
    setQuery(v);
    if (!deferred) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange?.(v), debounceMs);
    }
  };

  // ── Inline: deferred submit (Enter key or button click) ─────────────────────
  const handleDeferredSubmit = () => {
    onChange?.(query);
  };

  // ── Inline: clear — always instant ──────────────────────────────────────────
  const handleClear = () => {
    setQuery("");
    onChange?.("");
    onClear?.();
  };

  // ── Overlay: nav suggestions ─────────────────────────────────────────────────
  const router = useRouter();
  const { suggestions, isLoading: suggestionsLoading } = useNavSuggestions(
    isInlineMode ? "" : query,
  );

  const handleSuggestionClick = (record: AlgoliaNavRecord) => {
    onClose?.();
    router.push(record.url);
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
      <div className={`flex items-center gap-2 ${className ?? ""}`}>
        {/* Input wrapper */}
        <div className="relative flex-1 flex items-center">
          {/* Leading search icon — decorative in deferred mode, functional in live mode */}
          <svg
            className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none"
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
            onKeyDown={(e) => {
              if (deferred && e.key === "Enter") handleDeferredSubmit();
            }}
            placeholder={placeholder}
            className={`${THEME_CONSTANTS.input.base} ${THEME_CONSTANTS.themed.bgInput} ${THEME_CONSTANTS.themed.border} ${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.placeholder} ${THEME_CONSTANTS.themed.focusRing} w-full pl-9${query ? " pr-9" : ""}`}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
              className="absolute right-3 p-0.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              aria-label={t("clearAriaLabel")}
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
            </Button>
          )}
        </div>
        {/* Deferred submit button — visible beside the input, clickable alternative to Enter */}
        {deferred && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleDeferredSubmit}
            aria-label={t("ariaLabel")}
            className="flex-shrink-0 px-3 py-2 rounded-lg border border-zinc-300 dark:border-slate-600 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-700 transition-colors"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Button>
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
            <Button
              variant="ghost"
              onClick={() => onClose?.()}
              className={`p-2.5 md:p-3 rounded-xl transition-colors ${THEME_CONSTANTS.colors.iconButton.onLight} flex-shrink-0`}
              aria-label={t("closeAriaLabel")}
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
            </Button>
          </div>

          {/* Navigation Suggestions Preview */}
          {query && (
            <div
              className={`mt-3 ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.themed.border} rounded-xl overflow-hidden`}
            >
              {suggestionsLoading ? (
                <div className="px-4 py-3">
                  <Text variant="secondary" size="sm">
                    {t("searching")}
                  </Text>
                </div>
              ) : suggestions.length > 0 ? (
                <Ul>
                  {suggestions.map((s) => (
                    <Li key={s.objectID}>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left ${THEME_CONSTANTS.themed.hover} transition-colors border-b ${THEME_CONSTANTS.themed.border} last:border-b-0`}
                      >
                        <span className="text-sm">{NAV_TYPE_ICON[s.type]}</span>
                        <div className="flex-1 min-w-0">
                          <Text size="sm" className="font-medium truncate">
                            {s.title}
                          </Text>
                          {s.subtitle && (
                            <Text
                              variant="secondary"
                              size="xs"
                              className="truncate"
                            >
                              {s.subtitle}
                            </Text>
                          )}
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${NAV_TYPE_BADGE[s.type]}`}
                        >
                          {s.type}
                        </span>
                      </button>
                    </Li>
                  ))}
                </Ul>
              ) : null}
              {/* Always show "search products" footer */}
              <button
                type="button"
                onClick={handleOverlaySearch}
                className={`w-full flex items-center gap-2 px-4 py-3 text-left ${THEME_CONSTANTS.themed.hover} transition-colors ${suggestions.length > 0 ? `border-t ${THEME_CONSTANTS.themed.border}` : ""}`}
              >
                <svg
                  className={`w-4 h-4 flex-shrink-0 ${THEME_CONSTANTS.colors.icon.muted}`}
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
                <Text size="sm" className="font-medium">
                  {t("browseProducts", { q: query })}
                </Text>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
