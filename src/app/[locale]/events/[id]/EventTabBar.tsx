"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { TabBarShell } from "@mohasinac/appkit/client";
import { EVENT_TAB } from "./_constants";

type Tab = { value: string; label: string; href: string };

interface Props {
  tabs: Tab[];
}

export function EventTabBar({ tabs }: Props) {
  const pathname = usePathname();

  // Class adoption rather than a <Tabs> consumer: these are locale-aware
  // <Link>s with a per-tab prefetch heuristic and pathname-derived active
  // state, none of which a button-driven <Tabs> can express. `TabBarShell`
  // supplies the rail and the overflow arrows; `.appkit-tabs-trigger`
  // supplies the look, replacing the hand-rolled `border-b-2 -mb-px` +
  // `border-primary text-primary` string this used to carry.
  return (
    <TabBarShell ariaLabel="Event sections" activeKey={pathname}>
      {tabs.map((tab) => {
        const isActive =
          tab.value === EVENT_TAB.OVERVIEW
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.value}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            scroll={false}
            prefetch={tab.value !== EVENT_TAB.LEADERBOARD && tab.value !== EVENT_TAB.SPIN}
            className="appkit-tabs-trigger"
          >
            {tab.label}
          </Link>
        );
      })}
    </TabBarShell>
  );
}
