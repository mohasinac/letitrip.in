"use client";

import { usePathname } from "@/i18n/navigation";
import { THEME_CONSTANTS } from "@/constants";
import { Nav } from "@mohasinac/appkit/ui";
import { TextLink } from "../typography/TextLink";
import { Span } from "@mohasinac/appkit/ui";

/**
 * SectionTabs
 *
 * Navigation tab strip used across admin, user, seller, and public pages.
 *
 * Two modes:
 *
 * **Nav mode** (default) — each tab has an `href`; active tab is detected via
 * `usePathname`. Renders `<TextLink>` elements. Used for full-page URL routing.
 *
 * **Controlled mode** — pass `value` + `onChange`; each tab has a `value`.
 * Renders `<button>` elements. Used for inline filter strips (e.g. FAQ categories)
 * where clicking fires a callback instead of navigating.
 *
 * Design:
 * - Single scrollable row — no separate mobile/desktop variants.
 * - Tabs grow to fill available width equally; overflow → horizontal scroll.
 * - Active tab: brand colour + thick bottom underline.
 * - Scrollbar always visible so users know more tabs are reachable.
 * - `inline` prop removes the sticky full-width wrapper for embedded use.
 */

export interface SectionTab {
  label: string;
  /** Nav mode: URL to navigate to. */
  href?: string;
  /** Controlled mode: identifier passed to `onChange`. Falls back to `href`. */
  value?: string;
  icon?: React.ReactNode;
  /** Optional count badge shown next to the label. */
  count?: number;
}

interface SectionTabsProps {
  tabs: readonly SectionTab[];
  variant?: "admin" | "user" | "default";
  className?: string;
  /**
   * Controlled mode: currently selected tab value.
   * When provided together with `onChange`, the component renders buttons
   * instead of links.
   */
  value?: string;
  /**
   * Controlled mode: called with the tab's `value` (or `href`) when clicked.
   */
  onChange?: (value: string) => void;
  /**
   * When true, skips the sticky full-width wrapper and renders the scroll
   * strip directly. Use this for embedded inline tab strips.
   */
  inline?: boolean;
}

export function SectionTabs({
  tabs,
  variant = "default",
  className = "",
  value,
  onChange,
  inline = false,
}: SectionTabsProps) {
  const pathname = usePathname();
  const isControlled = typeof onChange === "function";

  const isActiveTab = (tab: SectionTab): boolean => {
    if (isControlled) {
      return value === (tab.value ?? tab.href ?? "");
    }
    const href = tab.href ?? "";
    if (href.endsWith("/dashboard") || href.endsWith("/profile")) {
      return pathname === href;
    }
    return pathname?.startsWith(href) ?? false;
  };

  const getTabKey = (tab: SectionTab) => tab.value ?? tab.href ?? tab.label;

  const getVariantGradient = () => {
    switch (variant) {
      case "admin":
        return "bg-gradient-to-r from-purple-50/60 via-transparent to-indigo-50/30 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/10";
      case "user":
        return "bg-gradient-to-r from-indigo-50/60 via-transparent to-teal-50/30 dark:from-indigo-950/20 dark:via-transparent dark:to-teal-950/10";
      default:
        return "";
    }
  };

  const { themed, utilities, flex } = THEME_CONSTANTS;

  const tabActiveClass =
    "border-b-primary text-primary bg-primary/5 dark:bg-primary/10";
  const tabInactiveClass = `border-b-transparent ${themed.textSecondary} hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-slate-800/50`;

  const tabBaseClass = [
    "flex-1 min-w-fit flex-shrink-0",
    `inline-${flex.center} gap-1.5`,
    "whitespace-nowrap text-sm font-medium",
    "px-3 sm:px-5 py-3",
    "relative border-b-[3px]",
    "transition-all duration-200",
  ].join(" ");

  const scrollStrip = (
    <Nav aria-label="Section navigation">
      <div
        className={[
          "overflow-x-auto touch-pan-x",
          utilities.scrollbarThinX,
          "pb-0.5",
          inline ? "" : "px-2 md:px-4",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={["flex min-w-max", inline ? "" : "lg:min-w-0 lg:w-full"]
            .filter(Boolean)
            .join(" ")}
        >
          {tabs.map((tab) => {
            const isActive = isActiveTab(tab);
            const key = getTabKey(tab);
            const tabClass = `${tabBaseClass} ${isActive ? tabActiveClass : tabInactiveClass}`;

            const content = (
              <>
                {tab.icon && (
                  <Span variant="inherit" className="flex-shrink-0" aria-hidden>
                    {tab.icon}
                  </Span>
                )}
                {tab.label}
                {tab.count !== undefined && (
                  <Span
                    className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-zinc-100 dark:bg-slate-700 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {tab.count}
                  </Span>
                )}
              </>
            );

            if (isControlled) {
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onChange(tab.value ?? tab.href ?? "")}
                  className={tabClass}
                >
                  {content}
                </button>
              );
            }

            return (
              <TextLink key={key} href={tab.href!} className={tabClass}>
                {content}
              </TextLink>
            );
          })}
        </div>
      </div>
    </Nav>
  );

  if (inline) {
    return <div className={className}>{scrollStrip}</div>;
  }

  return (
    <div
      className={`sticky top-12 md:top-[108px] z-10 ${themed.bgSecondary} border-b ${themed.border} shadow-sm ${getVariantGradient()} ${className}`}
    >
      <div className="container mx-auto max-w-7xl">{scrollStrip}</div>
    </div>
  );
}
