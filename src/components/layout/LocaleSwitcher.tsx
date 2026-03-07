"use client";

/**
 * LocaleSwitcher
 *
 * Searchable dropdown that switches between supported locales without a full
 * page reload.
 *
 * Behaviour:
 * - Trigger button shows the active locale label + chevron
 * - Clicking the trigger opens a dropdown with an inline search input
 * - Typing in search filters the locale list in real-time
 * - Selecting a locale calls `router.replace(pathname, { locale })` and
 *   closes the dropdown
 * - Click-outside or Escape closes without switching
 *
 * @example
 * ```tsx
 * <LocaleSwitcher />
 * ```
 */

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { THEME_CONSTANTS } from "@/constants";
import { Button, Input, Li, Span, Ul } from "@/components";
import { classNames } from "@/helpers";

export default function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputId = useId();

  const filtered = routing.locales.filter((loc) =>
    t(loc as Locale)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function switchLocale(next: Locale) {
    if (next !== locale) router.replace(pathname, { locale: next });
    setOpen(false);
    setSearch("");
  }

  function handleTrigger() {
    setOpen((prev) => {
      if (prev) setSearch("");
      return !prev;
    });
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const { themed } = THEME_CONSTANTS;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <Button
        variant="ghost"
        onClick={handleTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("switchTo")}
        className={classNames(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
          themed.border,
        )}
      >
        <Span>{t(locale as Locale)}</Span>
        <svg
          className={classNames(
            "w-3.5 h-3.5 transition-transform duration-150",
            open ? "rotate-180" : "",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={classNames(
            "absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border shadow-lg",
            themed.border,
            themed.bgElevated,
          )}
        >
          {/* Search input */}
          <div className={classNames("p-1.5 border-b", themed.border)}>
            <Input
              id={searchInputId}
              type="search"
              placeholder={t("search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t("search")}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className="py-1 text-xs"
            />
          </div>

          {/* Locale list */}
          <Ul role="listbox" aria-label={t("switchTo")} className="py-1">
            {filtered.length === 0 ? (
              <Li className="px-3 py-2">
                <Span className={`text-xs ${themed.textMuted}`}>
                  {t("noResults")}
                </Span>
              </Li>
            ) : (
              filtered.map((loc) => {
                const isActive = loc === locale;
                return (
                  <Li key={loc} role="option" aria-selected={isActive}>
                    <Button
                      variant="ghost"
                      onClick={() => switchLocale(loc as Locale)}
                      aria-pressed={isActive}
                      className={classNames(
                        "w-full justify-start px-3 py-1.5 text-xs rounded-none",
                        isActive
                          ? "bg-blue-600 text-white font-semibold"
                          : `${themed.textSecondary} hover:bg-blue-50 dark:hover:bg-blue-900/20`,
                      )}
                    >
                      {t(loc as Locale)}
                    </Button>
                  </Li>
                );
              })
            )}
          </Ul>
        </div>
      )}
    </div>
  );
}
