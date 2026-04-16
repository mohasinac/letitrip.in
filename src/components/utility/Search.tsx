"use client";

import {
  BookOpen,
  CalendarDays,
  Gavel,
  HelpCircle,
  LayoutGrid,
  Package,
  ShoppingBag,
  Store,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import {
  Search as AppkitSearch,
  type SearchProps,
  type SearchQuickLink,
} from "@mohasinac/appkit/features/search";
import { useTranslations } from "next-intl";

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

type LocalSearchProps = Omit<
  SearchProps,
  "router" | "quickLinks" | "labels"
>;

export function Search(props: LocalSearchProps) {
  const router = useRouter();
  const t = useTranslations("search");
  const tNav = useTranslations("nav");
  const tActions = useTranslations("actions");

  const quickLinks: SearchQuickLink[] = [
    {
      href: ROUTES.PUBLIC.PRODUCTS,
      label: tNav("products"),
      icon: ShoppingBag,
      keywords: ["shop", "buy", "items", "figure"],
    },
    {
      href: ROUTES.PUBLIC.AUCTIONS,
      label: tNav("auctions"),
      icon: Gavel,
      keywords: ["bid", "live", "auction", "gavel"],
    },
    {
      href: ROUTES.PUBLIC.CATEGORIES,
      label: tNav("categories"),
      icon: LayoutGrid,
      keywords: ["browse", "category", "genre"],
    },
    {
      href: ROUTES.PUBLIC.STORES,
      label: tNav("stores"),
      icon: Store,
      keywords: ["seller", "brand", "vendor", "shop"],
    },
    {
      href: ROUTES.PUBLIC.EVENTS,
      label: tNav("events"),
      icon: CalendarDays,
      keywords: ["event", "contest", "tournament"],
    },
    {
      href: ROUTES.PUBLIC.BLOG,
      label: tNav("blog"),
      icon: BookOpen,
      keywords: ["article", "news", "guide", "read"],
    },
    {
      href: ROUTES.PUBLIC.PROMOTIONS,
      label: tNav("promotions"),
      icon: Tag,
      keywords: ["deals", "discount", "promo", "offer"],
    },
    {
      href: ROUTES.PUBLIC.SELLERS,
      label: tNav("sellers"),
      icon: TrendingUp,
      keywords: ["sell", "vendor", "business"],
    },
    {
      href: ROUTES.PUBLIC.HELP,
      label: tNav("helpCenter"),
      icon: HelpCircle,
      keywords: ["help", "support", "faq", "question"],
    },
    {
      href: ROUTES.PUBLIC.TRACK_ORDER,
      label: tActions("trackMyOrder"),
      icon: Package,
      keywords: ["track", "order", "shipping", "delivery"],
    },
  ];

  return (
    <AppkitSearch
      {...props}
      router={router}
      quickLinks={quickLinks}
      labels={{
        placeholder: t("placeholder"),
        title: t("title"),
        closeAriaLabel: t("closeAriaLabel"),
        quickLinks: t("quickLinks"),
        searching: t("searching"),
        clearAriaLabel: t("clearAriaLabel"),
        ariaLabel: t("ariaLabel"),
        browseProducts: (query) => t("browseProducts", { q: query }),
      }}
    />
  );
}

export default Search;

