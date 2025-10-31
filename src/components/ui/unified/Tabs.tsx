/**
 * Unified Tabs Component
 * Accessible tab navigation with keyboard support
 * Multiple variants and orientations
 */

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  content: React.ReactNode;
}

export interface UnifiedTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
  className?: string;
}

export const UnifiedTabs: React.FC<UnifiedTabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = "default",
  orientation = "horizontal",
  fullWidth = false,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.disabled) return;

    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    tabId: string,
    index: number
  ) => {
    let newIndex = index;

    if (orientation === "horizontal") {
      if (e.key === "ArrowLeft") newIndex = Math.max(0, index - 1);
      if (e.key === "ArrowRight")
        newIndex = Math.min(tabs.length - 1, index + 1);
    } else {
      if (e.key === "ArrowUp") newIndex = Math.max(0, index - 1);
      if (e.key === "ArrowDown")
        newIndex = Math.min(tabs.length - 1, index + 1);
    }

    if (newIndex !== index && !tabs[newIndex].disabled) {
      handleTabChange(tabs[newIndex].id);
      e.preventDefault();
    }
  };

  const variantClasses = {
    default: {
      list: "border-b-2 border-border",
      tab: cn(
        "px-4 py-3 border-b-2 -mb-0.5 transition-colors",
        "border-transparent hover:border-primary/50"
      ),
      activeTab: "border-primary text-primary font-semibold",
      inactiveTab: "text-textSecondary",
    },
    pills: {
      list: "gap-2 p-1 bg-surfaceVariant rounded-lg",
      tab: "px-4 py-2 rounded-md transition-colors",
      activeTab: "bg-primary text-white font-semibold",
      inactiveTab: "text-textSecondary hover:bg-surface",
    },
    underline: {
      list: "gap-6",
      tab: cn(
        "px-2 py-3 border-b-2 transition-colors",
        "border-transparent hover:border-primary/50"
      ),
      activeTab: "border-primary text-primary font-semibold",
      inactiveTab: "text-textSecondary",
    },
  };

  const styles = variantClasses[variant];

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-row gap-6" : "flex-col",
        className
      )}
    >
      {/* Tab List */}
      <div
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          fullWidth && orientation === "horizontal" && "w-full",
          styles.list
        )}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
            className={cn(
              "flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50",
              styles.tab,
              activeTab === tab.id ? styles.activeTab : styles.inactiveTab,
              tab.disabled && "opacity-50 cursor-not-allowed",
              fullWidth &&
                orientation === "horizontal" &&
                "flex-1 justify-center"
            )}
          >
            {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={cn(
                  "ml-2 px-2 py-0.5 rounded-full text-xs font-semibold",
                  activeTab === tab.id
                    ? "bg-white/20"
                    : "bg-primary/10 text-primary"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className={cn("flex-1", orientation === "vertical" && "min-w-0")}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`tabpanel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
            className={cn(
              "focus:outline-none",
              activeTab === tab.id && "animate-fadeIn"
            )}
            tabIndex={0}
          >
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SIMPLE TAB NAVIGATION (Without Content)
// ============================================================================

export interface SimpleTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface SimpleTabsProps {
  tabs: SimpleTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  fullWidth?: boolean;
  className?: string;
}

export const SimpleTabs: React.FC<SimpleTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "default",
  fullWidth = false,
  className,
}) => {
  return (
    <UnifiedTabs
      tabs={tabs.map((tab) => ({ ...tab, content: null }))}
      defaultTab={activeTab}
      onChange={onChange}
      variant={variant}
      fullWidth={fullWidth}
      className={className}
    />
  );
};

export default UnifiedTabs;
