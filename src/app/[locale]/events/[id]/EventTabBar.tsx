"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { Div } from "@mohasinac/appkit/client";
import { EVENT_TAB } from "./_constants";

type Tab = { value: string; label: string; href: string };

interface Props {
  tabs: Tab[];
}

export function EventTabBar({ tabs }: Props) {
  const pathname = usePathname();

  return (
    <Div
      role="tablist"
      className="flex gap-[var(--appkit-space-2)] border-b border-[var(--appkit-color-border)] overflow-x-auto"
    >
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
            className={`px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
 isActive
 ? "border-primary text-primary"
 : "border-transparent text-[var(--appkit-color-text-muted)] hover:text-zinc-800 hover:text-[var(--appkit-color-text-muted)]"
 }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </Div>
  );
}
