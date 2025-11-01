/**
 * TabNavigation Component
 *
 * A flexible tab navigation component with multiple variants, icons, badges,
 * and optional URL synchronization.
 *
 * @example
 * ```tsx
 * <TabNavigation
 *   tabs={[
 *     { id: 'basic', label: 'Basic Info', icon: <Info />, badge: 3 },
 *     { id: 'advanced', label: 'Advanced', icon: <Settings /> },
 *     { id: 'seo', label: 'SEO', icon: <Search />, disabled: true }
 *   ]}
 *   value={activeTab}
 *   onChange={setActiveTab}
 *   variant="underline"
 * />
 * ```
 */

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface Tab {
  /** Unique tab identifier */
  id: string;
  /** Tab label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional badge count or text */
  badge?: string | number;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Optional aria-label */
  "aria-label"?: string;
  /** Optional custom content (overrides label) */
  content?: React.ReactNode;
}

export interface TabNavigationProps {
  /** Array of tabs */
  tabs: Tab[];
  /** Currently active tab ID */
  value: string;
  /** Callback when tab changes */
  onChange: (tabId: string) => void;
  /** Visual variant */
  variant?: "underline" | "pills" | "bordered" | "segmented";
  /** Tab orientation */
  orientation?: "horizontal" | "vertical";
  /** Whether tabs fill available width */
  fullWidth?: boolean;
  /** Sync tab state with URL search params */
  syncWithUrl?: boolean;
  /** URL param name (if syncWithUrl is true) */
  urlParam?: string;
  /** Show confirmation before switching tabs if content has changes */
  confirmOnChange?: boolean;
  /** Message for change confirmation */
  confirmMessage?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class name */
  className?: string;
  /** Callback before tab change (return false to prevent change) */
  onBeforeChange?: (
    fromTab: string,
    toTab: string
  ) => boolean | Promise<boolean>;
}

export const TabNavigation = React.forwardRef<
  HTMLDivElement,
  TabNavigationProps
>(
  (
    {
      tabs,
      value,
      onChange,
      variant = "underline",
      orientation = "horizontal",
      fullWidth = false,
      syncWithUrl = false,
      urlParam = "tab",
      confirmOnChange = false,
      confirmMessage = "You have unsaved changes. Are you sure you want to switch tabs?",
      size = "md",
      className,
      onBeforeChange,
    },
    ref
  ) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isDirty, setIsDirty] = useState(false);

    // Sync with URL on mount
    useEffect(() => {
      if (syncWithUrl && searchParams) {
        const urlTab = searchParams.get(urlParam);
        if (urlTab && tabs.some((tab) => tab.id === urlTab)) {
          onChange(urlTab);
        }
      }
    }, []);

    const handleTabClick = async (tab: Tab) => {
      if (tab.disabled || tab.id === value) return;

      // Check if we should prevent the change
      if (onBeforeChange) {
        const canChange = await onBeforeChange(value, tab.id);
        if (!canChange) return;
      }

      // Confirm if dirty
      if (confirmOnChange && isDirty) {
        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) return;
      }

      // Update state
      onChange(tab.id);

      // Update URL if sync is enabled
      if (syncWithUrl && router) {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.set(urlParam, tab.id);
        router.push(`?${params.toString()}`, { scroll: false });
      }

      setIsDirty(false);
    };

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "text-sm px-3 py-1.5";
        case "lg":
          return "text-base px-6 py-3";
        default:
          return "text-sm px-4 py-2";
      }
    };

    const getVariantClasses = (tab: Tab, isActive: boolean) => {
      const baseClasses = cn(
        "flex items-center gap-2 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        getSizeClasses()
      );

      switch (variant) {
        case "underline":
          return cn(
            baseClasses,
            "border-b-2 rounded-t-lg",
            isActive
              ? "border-primary text-primary font-medium"
              : "border-transparent text-textSecondary hover:text-text hover:border-border"
          );

        case "pills":
          return cn(
            baseClasses,
            "rounded-full",
            isActive
              ? "bg-primary text-white font-medium"
              : "bg-surface text-textSecondary hover:bg-surface hover:text-text"
          );

        case "bordered":
          return cn(
            baseClasses,
            "border rounded-lg",
            isActive
              ? "border-primary bg-primary/5 text-primary font-medium"
              : "border-border text-textSecondary hover:border-primary hover:text-text"
          );

        case "segmented":
          return cn(
            baseClasses,
            "first:rounded-l-lg last:rounded-r-lg border-y border-r first:border-l",
            isActive
              ? "bg-primary text-white font-medium z-10"
              : "bg-surface text-textSecondary hover:bg-background"
          );

        default:
          return baseClasses;
      }
    };

    const renderTab = (tab: Tab) => {
      const isActive = tab.id === value;

      return (
        <button
          key={tab.id}
          role="tab"
          aria-selected={isActive}
          aria-controls={`tabpanel-${tab.id}`}
          aria-label={tab["aria-label"] || tab.label}
          disabled={tab.disabled}
          onClick={() => handleTabClick(tab)}
          className={getVariantClasses(tab, isActive)}
        >
          {tab.content || (
            <>
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span className={fullWidth ? "flex-1 text-center" : ""}>
                {tab.label}
              </span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    isActive
                      ? variant === "pills"
                        ? "bg-white text-primary"
                        : "bg-primary text-white"
                      : "bg-surface text-textSecondary"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </>
          )}
        </button>
      );
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          "flex",
          orientation === "vertical"
            ? "flex-col space-y-1"
            : variant === "segmented"
            ? "flex-row -space-x-px"
            : "flex-row space-x-1 overflow-x-auto",
          variant === "underline" && orientation === "horizontal"
            ? "border-b border-border"
            : "",
          fullWidth && orientation === "horizontal" ? "w-full" : "",
          className
        )}
      >
        {tabs.map(renderTab)}
      </div>
    );
  }
);

TabNavigation.displayName = "TabNavigation";

/**
 * Hook for managing tab navigation state
 *
 * @example
 * ```tsx
 * const { activeTab, setActiveTab, goToTab, markDirty } = useTabNavigation('basic');
 *
 * // Mark as dirty when form changes
 * const handleInputChange = () => {
 *   markDirty();
 * };
 *
 * return (
 *   <TabNavigation
 *     tabs={tabs}
 *     value={activeTab}
 *     onChange={setActiveTab}
 *   />
 * );
 * ```
 */
export function useTabNavigation(initialTab: string) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isDirty, setIsDirty] = useState(false);

  const goToTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsDirty(false);
  };

  const markDirty = () => {
    setIsDirty(true);
  };

  const markClean = () => {
    setIsDirty(false);
  };

  return {
    activeTab,
    setActiveTab: goToTab,
    goToTab,
    isDirty,
    markDirty,
    markClean,
  };
}
