"use client";

import { TabNav } from "./TabNav";
import type { Tab } from "@/constants/tabs";

interface TabbedLayoutProps {
  tabs: Tab[];
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "default" | "pills" | "underline";
}

export function TabbedLayout({
  tabs,
  title,
  description,
  children,
  actions,
  variant = "underline",
}: TabbedLayoutProps) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header with title and actions */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Tab Navigation */}
      <TabNav tabs={tabs} variant={variant} className="mb-6" />

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
