"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { OverflowRow, type OverflowRowItem } from "@mohasinac/appkit/client";
import { EVENT_TAB } from "./_constants";

type Tab = { value: string; label: string; href: string };

interface Props {
  tabs: Tab[];
}

export function EventTabBar({ tabs }: Props) {
  const pathname = usePathname();

  // Overview matches exactly; every other tab also owns its sub-paths, so a
  // nested route keeps its parent tab lit.
  const activeTab = tabs.find((tab) =>
    tab.value === EVENT_TAB.OVERVIEW
      ? pathname === tab.href
      : pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );

  const items: OverflowRowItem[] = tabs.map((tab) => ({
    id: tab.value,
    label: tab.label,
    href: tab.href,
  }));

  /*
   * `linkAs` is the locale-aware `Link` from `@/i18n/navigation`, NOT the
   * `next/link` default — these hrefs are unprefixed and the locale segment is
   * added by that wrapper. Passing a plain anchor (or letting the default
   * through) would drop the locale and bounce every tab through a redirect.
   *
   * `scroll: false` is load-bearing — the app mounts a global `<ScrollToTop>`
   * keyed on pathname, so without it every tab click yanks the page to the top
   * before the panel below has even swapped.
   */
  return (
    <OverflowRow
      items={items}
      ariaLabel="Event sections"
      activeId={activeTab?.value}
      linkAs={Link}
      linkProps={{ scroll: false }}
      searchPlaceholder="Search sections…"
    />
  );
}
