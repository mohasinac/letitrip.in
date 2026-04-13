"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { Li, Row, Text, Ul, Span, Button } from "@mohasinac/appkit/ui";
import { Input } from "@/components";
import { useTranslations } from "next-intl";
import { useNavSuggestions } from "@/hooks";
import type { NavSuggestionRecord } from "@/hooks";
import {
  ShoppingBag,
  Gavel,
  LayoutGrid,
  Store,
  CalendarDays,
  BookOpen,
  Tag,
  TrendingUp,
  HelpCircle,
  Package,
  type LucideIcon,
} from "lucide-react";

const NAV_TYPE_ICON: Record<NavSuggestionRecord["type"], string> = {
  page: "📄",
  category: "🗂️",
  blog: "✍️",
  event: "🎉",
};

interface SiteLink {
  href: string;
  labelKey: string;
  labelNamespace: "nav" | "actions";
  icon: LucideIcon;
  keywords: string[];
}

const SITE_LINKS: SiteLink[] = [
  {
    href: ROUTES.PUBLIC.PRODUCTS,
    labelKey: "products",
    labelNamespace: "nav",
    icon: ShoppingBag,
    keywords: ["shop", "buy", "items", "figure"],
  },
  {
    href: ROUTES.PUBLIC.AUCTIONS,
    labelKey: "auctions",
    labelNamespace: "nav",
    icon: Gavel,
    keywords: ["bid", "live", "auction", "gavel"],
  },
  {
    href: ROUTES.PUBLIC.CATEGORIES,
    labelKey: "categories",
    labelNamespace: "nav",
    icon: LayoutGrid,
    keywords: ["browse", "category", "genre"],
  },
  {
    href: ROUTES.PUBLIC.STORES,
    labelKey: "stores",
    labelNamespace: "nav",
    icon: Store,
    keywords: ["seller", "brand", "vendor", "shop"],
  },
  {
    href: ROUTES.PUBLIC.EVENTS,
    labelKey: "events",
    labelNamespace: "nav",
    icon: CalendarDays,
    keywords: ["event", "contest", "tournament"],
  },
  {
    href: ROUTES.PUBLIC.BLOG,
    labelKey: "blog",
    labelNamespace: "nav",
    icon: BookOpen,
    keywords: ["article", "news", "guide", "read"],
  },
  {
    href: ROUTES.PUBLIC.PROMOTIONS,
    labelKey: "promotions",
    labelNamespace: "nav",
    icon: Tag,
    keywords: ["deals", "discount", "promo", "offer"],
  },
  {
    href: ROUTES.PUBLIC.SELLERS,
    labelKey: "sellers",
    labelNamespace: "nav",
    icon: TrendingUp,
    keywords: ["sell", "vendor", "business"],
  },
  {
    href: ROUTES.PUBLIC.HELP,
    labelKey: "helpCenter",
    labelNamespace: "nav",
    icon: HelpCircle,
    keywords: ["help", "support", "faq", "question"],
  },
  {
    href: ROUTES.PUBLIC.TRACK_ORDER,
    labelKey: "trackMyOrder",
    labelNamespace: "actions",
    icon: Package,
    keywords: ["track", "order", "shipping", "delivery"],
  },
];

const NAV_TYPE_BADGE: Record<NavSuggestionRecord["type"], string> = {
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
  const tNav = useTranslations("nav");
  const tActions = useTranslations("actions");

  // ── Shared state ────────────────────────────────────────────────────────────
  const [query, setQuery] = useState(isInlineMode ? value : "");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isInlineOpen, setIsInlineOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inlineBlurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getSiteLinkLabel = (link: SiteLink): string =>
    link.labelNamespace === "nav"
      ? tNav(link.labelKey)
      : tActions(link.labelKey);

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
    setActiveIndex(-1);
    onChange?.("");
    onClear?.();
  };

  // ── Overlay: nav suggestions ─────────────────────────────────────────────────
  const router = useRouter();
  const { suggestions, isLoading: suggestionsLoading } =
    useNavSuggestions(query);

  useEffect(() => {
    setActiveIndex(-1);
  }, [isOpen, isInlineMode, query, suggestions.length]);

  const handleSuggestionClick = (record: NavSuggestionRecord) => {
    setIsInlineOpen(false);
    onClose?.();
    router.push(record.url);
  };

  // ── Overlay handlers ─────────────────────────────────────────────────────────
  const handleOverlaySearch = () => {
    if (query.trim() && onSearch) onSearch(query);
  };

  // ── INLINE RENDER ────────────────────────────────────────────────────────────
  if (isInlineMode) {
    const inlineQ = query.toLowerCase();
    const inlineQuickLinks = query
      ? SITE_LINKS.filter(
          (link) =>
            getSiteLinkLabel(link).toLowerCase().includes(inlineQ) ||
            link.keywords.some((k) => k.includes(inlineQ)),
        ).slice(0, 5)
      : SITE_LINKS.slice(0, 5);
    const inlineQuickLinkItems = inlineQuickLinks.map((link) => ({
      kind: "quick-link" as const,
      link,
    }));
    const inlineSuggestionItems = suggestions.slice(0, 5).map((suggestion) => ({
      kind: "suggestion" as const,
      suggestion,
    }));
    const inlineItems = [
      ...inlineQuickLinkItems,
      ...inlineSuggestionItems,
      ...(query.trim() ? ([{ kind: "search" as const }] as const) : []),
    ];

    const handleInlineActiveItem = (index: number) => {
      const item = inlineItems[index];
      if (!item) return;

      if (item.kind === "quick-link") {
        setIsInlineOpen(false);
        router.push(item.link.href);
        return;
      }

      if (item.kind === "suggestion") {
        handleSuggestionClick(item.suggestion);
        return;
      }

      handleDeferredSubmit();
      setIsInlineOpen(false);
    };

    return (
      <div className={`relative flex items-center gap-2 ${className ?? ""}`}>
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
          <Input
            ref={inputRef}
            bare
            type="search"
            value={query}
            onChange={(e) => handleInlineChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                if (inlineItems.length === 0) return;
                e.preventDefault();
                setIsInlineOpen(true);
                setActiveIndex((current) =>
                  current < inlineItems.length - 1 ? current + 1 : 0,
                );
                return;
              }

              if (e.key === "ArrowUp") {
                if (inlineItems.length === 0) return;
                e.preventDefault();
                setIsInlineOpen(true);
                setActiveIndex((current) =>
                  current <= 0 ? inlineItems.length - 1 : current - 1,
                );
                return;
              }

              if (e.key === "Enter") {
                if (activeIndex >= 0) {
                  e.preventDefault();
                  handleInlineActiveItem(activeIndex);
                  return;
                }
                if (deferred) {
                  handleDeferredSubmit();
                }
                return;
              }

              if (e.key === "Escape") {
                setIsInlineOpen(false);
              }
            }}
            onFocus={() => {
              if (inlineBlurRef.current) clearTimeout(inlineBlurRef.current);
              setIsInlineOpen(true);
            }}
            onBlur={() => {
              if (inlineBlurRef.current) clearTimeout(inlineBlurRef.current);
              inlineBlurRef.current = setTimeout(
                () => setIsInlineOpen(false),
                120,
              );
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

        {isInlineOpen && (inlineQuickLinks.length > 0 || query) && (
          <div
            className={`absolute top-full left-0 right-0 mt-2 ${THEME_CONSTANTS.zIndex.search} ${THEME_CONSTANTS.themed.bgSecondary} border ${THEME_CONSTANTS.themed.border} rounded-xl overflow-hidden shadow-lg`}
            onMouseDown={(e) => e.preventDefault()}
          >
            {inlineQuickLinks.length > 0 && (
              <Ul>
                {inlineQuickLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = activeIndex === index;

                  return (
                    <Li key={`inline-link-${link.href}`}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setIsInlineOpen(false);
                          router.push(link.href);
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b ${THEME_CONSTANTS.themed.border} ${isActive ? "bg-zinc-100 dark:bg-slate-700/70" : THEME_CONSTANTS.themed.hover}`}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${THEME_CONSTANTS.colors.icon.muted}`}
                        />
                        <Text size="sm" className="font-medium truncate">
                          {getSiteLinkLabel(link)}
                        </Text>
                      </Button>
                    </Li>
                  );
                })}
              </Ul>
            )}

            {query && suggestionsLoading && (
              <div className="px-4 py-3">
                <Text variant="secondary" size="sm">
                  {t("searching")}
                </Text>
              </div>
            )}

            {query &&
              suggestions.slice(0, 5).map((s, suggestionIndex) => {
                const itemIndex = inlineQuickLinkItems.length + suggestionIndex;
                const isActive = activeIndex === itemIndex;

                return (
                  <Button
                    key={`inline-suggestion-${s.objectID}`}
                    type="button"
                    variant="ghost"
                    onClick={() => handleSuggestionClick(s)}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b ${THEME_CONSTANTS.themed.border} ${isActive ? "bg-zinc-100 dark:bg-slate-700/70" : THEME_CONSTANTS.themed.hover}`}
                  >
                    <Span className="text-sm">{NAV_TYPE_ICON[s.type]}</Span>
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
                  </Button>
                );
              })}

            {query.trim() && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  handleDeferredSubmit();
                  setIsInlineOpen(false);
                }}
                onMouseEnter={() => setActiveIndex(inlineItems.length - 1)}
                className={`w-full flex items-center gap-2 px-4 py-3 text-left transition-colors ${activeIndex === inlineItems.length - 1 ? "bg-zinc-100 dark:bg-slate-700/70" : THEME_CONSTANTS.themed.hover}`}
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
                <Text size="sm" className="font-medium truncate">
                  {t("browseProducts", { q: query })}
                </Text>
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── OVERLAY: filtered quick links ──────────────────────────────────────────
  const q = query.toLowerCase();
  const filteredSiteLinks = query
    ? SITE_LINKS.filter(
        (link) =>
          getSiteLinkLabel(link).toLowerCase().includes(q) ||
          link.keywords.some((k) => k.includes(q)),
      ).slice(0, 6)
    : SITE_LINKS.slice(0, 6);

  const quickLinkItems = filteredSiteLinks.map((link) => ({
    kind: "quick-link" as const,
    link,
  }));
  const suggestionItems = suggestions.map((suggestion) => ({
    kind: "suggestion" as const,
    suggestion,
  }));
  const overlayItems = [
    ...quickLinkItems,
    ...suggestionItems,
    ...(query.trim() ? ([{ kind: "search" as const }] as const) : []),
  ];

  const handleActiveItem = (index: number) => {
    const item = overlayItems[index];
    if (!item) return;

    if (item.kind === "quick-link") {
      onClose?.();
      router.push(item.link.href);
      return;
    }

    if (item.kind === "suggestion") {
      handleSuggestionClick(item.suggestion);
      return;
    }

    handleOverlaySearch();
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      if (overlayItems.length === 0) return;
      e.preventDefault();
      setActiveIndex((current) =>
        current < overlayItems.length - 1 ? current + 1 : 0,
      );
      return;
    }

    if (e.key === "ArrowUp") {
      if (overlayItems.length === 0) return;
      e.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? overlayItems.length - 1 : current - 1,
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleActiveItem(activeIndex);
        return;
      }
      handleOverlaySearch();
      return;
    }

    if (e.key === "Escape") {
      onClose?.();
    }
  };

  // ── OVERLAY RENDER ───────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <>
      {/* Search bar row — part of the unified sticky header */}
      <div
        className={`${THEME_CONSTANTS.layout.titleBarBg} border-b ${THEME_CONSTANTS.themed.border} shadow-md animate-slide-down`}
      >
        <div className="container mx-auto px-4 py-3 md:py-4 relative">
          <Row gap="sm" className="md:gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                bare
                type="search"
                placeholder={t("placeholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleOverlayKeyDown}
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
              {t("title")}
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
          </Row>

          {/* Results dropdown — absolute so it overlays page content below the header */}
          {(filteredSiteLinks.length > 0 || query) && (
            <div
              className={`absolute top-full left-0 right-0 ${THEME_CONSTANTS.zIndex.search} px-4 pt-2 pb-4 space-y-2`}
            >
              {/* Quick Links — shown before typing (top 6) and filtered while typing */}
              {filteredSiteLinks.length > 0 && !suggestionsLoading && (
                <div
                  className={`${THEME_CONSTANTS.themed.bgSecondary} border ${THEME_CONSTANTS.themed.border} rounded-xl overflow-hidden shadow-lg`}
                >
                  <div
                    className={`px-4 py-2 border-b ${THEME_CONSTANTS.themed.border}`}
                  >
                    <Text
                      variant="secondary"
                      size="xs"
                      className="uppercase tracking-wider font-semibold"
                    >
                      {t("quickLinks")}
                    </Text>
                  </div>
                  <Ul>
                    {filteredSiteLinks.map((link) => {
                      const Icon = link.icon;
                      const itemIndex = quickLinkItems.findIndex(
                        (item) => item.link.href === link.href,
                      );
                      const isActive = activeIndex === itemIndex;

                      return (
                        <Li key={link.href}>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              onClose?.();
                              router.push(link.href);
                            }}
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b ${THEME_CONSTANTS.themed.border} last:border-b-0 ${isActive ? "bg-zinc-100 dark:bg-slate-700/70" : THEME_CONSTANTS.themed.hover}`}
                          >
                            <Icon
                              className={`w-4 h-4 flex-shrink-0 ${THEME_CONSTANTS.colors.icon.muted}`}
                            />
                            <Text size="sm" className="font-medium">
                              {getSiteLinkLabel(link)}
                            </Text>
                          </Button>
                        </Li>
                      );
                    })}
                  </Ul>
                </div>
              )}

              {/* Navigation Suggestions Preview */}
              {query && (
                <div
                  className={`${THEME_CONSTANTS.themed.bgSecondary} border ${THEME_CONSTANTS.themed.border} rounded-xl overflow-hidden shadow-lg`}
                >
                  {suggestionsLoading ? (
                    <div className="px-4 py-3">
                      <Text variant="secondary" size="sm">
                        {t("searching")}
                      </Text>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <Ul>
                      {suggestions.map((s, suggestionIndex) => {
                        const itemIndex =
                          quickLinkItems.length + suggestionIndex;
                        const isActive = activeIndex === itemIndex;

                        return (
                          <Li key={s.objectID}>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleSuggestionClick(s)}
                              onMouseEnter={() => setActiveIndex(itemIndex)}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b ${THEME_CONSTANTS.themed.border} last:border-b-0 ${isActive ? "bg-zinc-100 dark:bg-slate-700/70" : THEME_CONSTANTS.themed.hover}`}
                            >
                              <Span className="text-sm">
                                {NAV_TYPE_ICON[s.type]}
                              </Span>
                              <div className="flex-1 min-w-0">
                                <Text
                                  size="sm"
                                  className="font-medium truncate"
                                >
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
                              <Span
                                className={`text-xs px-2 py-0.5 rounded-full ${NAV_TYPE_BADGE[s.type]}`}
                              >
                                {s.type}
                              </Span>
                            </Button>
                          </Li>
                        );
                      })}
                    </Ul>
                  ) : null}
                  {/* Always show "search products" footer */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleOverlaySearch}
                    onMouseEnter={() => setActiveIndex(overlayItems.length - 1)}
                    className={
                      `w-full flex items-center gap-2 px-4 py-3 text-left transition-colors ${activeIndex === overlayItems.length - 1 ? "bg-zinc-100 dark:bg-slate-700/70" : THEME_CONSTANTS.themed.hover}` +
                      (suggestions.length > 0
                        ? ` border-t ${THEME_CONSTANTS.themed.border}`
                        : "")
                    }
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
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
