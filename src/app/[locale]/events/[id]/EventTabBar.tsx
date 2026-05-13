"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { EVENT_TAB } from "./_constants";

type Tab = { value: string; label: string; href: string };

interface Props {
  tabs: Tab[];
}

export function EventTabBar({ tabs }: Props) {
  const pathname = usePathname();

  return (
    <div
      role="tablist"
      className="flex gap-2 border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto"
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
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
