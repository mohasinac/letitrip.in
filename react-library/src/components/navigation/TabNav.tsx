import type { ComponentType, ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface Tab {
  id: string;
  label: string;
  href: string;
}

export interface TabNavProps<T = any> {
  tabs: Tab[];
  className?: string;
  variant?: "default" | "pills" | "underline";
  LinkComponent: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
    key?: string;
  }>;
  currentPath: string;
}

export function TabNav<T = any>({
  tabs,
  className,
  variant = "underline",
  LinkComponent,
  currentPath,
}: TabNavProps<T>) {
  // Check if a tab is active - exact match or starts with href (for nested routes)
  const isActive = (tab: Tab) => {
    // Exact match
    if (currentPath === tab.href) return true;
    // Check if it's a parent route (but not for query-based tabs)
    if (!tab.href.includes("?") && currentPath.startsWith(tab.href + "/"))
      return true;
    return false;
  };

  if (variant === "pills") {
    return (
      <nav className={cn("flex flex-wrap gap-2", className)}>
        {tabs.map((tab) => (
          <LinkComponent
            key={tab.id}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
              isActive(tab)
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {tab.label}
          </LinkComponent>
        ))}
      </nav>
    );
  }

  if (variant === "default") {
    return (
      <nav
        className={cn(
          "flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg",
          className
        )}
      >
        {tabs.map((tab) => (
          <LinkComponent
            key={tab.id}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
              isActive(tab)
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {tab.label}
          </LinkComponent>
        ))}
      </nav>
    );
  }

  // Underline variant (default)
  return (
    <nav
      className={cn(
        "flex gap-1 overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {tabs.map((tab) => (
        <LinkComponent
          key={tab.id}
          href={tab.href}
          className={cn(
            "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
            isActive(tab)
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
          )}
        >
          {tab.label}
        </LinkComponent>
      ))}
    </nav>
  );
}
