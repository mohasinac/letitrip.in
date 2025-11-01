/**
 * Sidebar Component
 *
 * A collapsible sidebar navigation with glassmorphism design, nested menus,
 * and state persistence.
 *
 * @example
 * ```tsx
 * <Sidebar
 *   items={[
 *     {
 *       id: 'dashboard',
 *       label: 'Dashboard',
 *       icon: <Home />,
 *       href: '/dashboard'
 *     },
 *     {
 *       id: 'products',
 *       label: 'Products',
 *       icon: <Package />,
 *       children: [
 *         { id: 'all', label: 'All Products', href: '/products' },
 *         { id: 'new', label: 'Add New', href: '/products/new' }
 *       ]
 *     }
 *   ]}
 *   mode="full"
 *   collapsible={true}
 * />
 * ```
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Link href */
  href?: string;
  /** Badge count or text */
  badge?: string | number;
  /** Nested children items */
  children?: SidebarItem[];
  /** Whether item is disabled */
  disabled?: boolean;
  /** Custom onClick handler */
  onClick?: () => void;
}

export interface SidebarProps {
  /** Navigation items */
  items: SidebarItem[];
  /** Display mode */
  mode?: "full" | "compact" | "icon-only";
  /** Whether sidebar is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Whether to persist state in localStorage */
  persistState?: boolean;
  /** LocalStorage key for state persistence */
  storageKey?: string;
  /** Show on mobile as drawer */
  mobileDrawer?: boolean;
  /** Additional class name */
  className?: string;
  /** Callback when mode changes */
  onModeChange?: (mode: "full" | "compact" | "icon-only") => void;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      items,
      mode: controlledMode,
      collapsible = true,
      defaultCollapsed = false,
      persistState = true,
      storageKey = "sidebar-state",
      mobileDrawer = true,
      className,
      onModeChange,
    },
    ref
  ) => {
    const pathname = usePathname();
    const [internalMode, setInternalMode] = useState<
      "full" | "compact" | "icon-only"
    >("full");
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [mobileOpen, setMobileOpen] = useState(false);

    const mode = controlledMode || internalMode;

    // Load state from localStorage
    useEffect(() => {
      if (persistState && typeof window !== "undefined") {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const { mode, collapsed, expanded } = JSON.parse(saved);
            if (mode) setInternalMode(mode);
            if (typeof collapsed === "boolean") setIsCollapsed(collapsed);
            if (Array.isArray(expanded)) setExpandedItems(new Set(expanded));
          } catch (e) {
            console.error("Failed to load sidebar state:", e);
          }
        }
      }
    }, [persistState, storageKey]);

    // Save state to localStorage
    useEffect(() => {
      if (persistState && typeof window !== "undefined") {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            mode: internalMode,
            collapsed: isCollapsed,
            expanded: Array.from(expandedItems),
          })
        );
      }
    }, [internalMode, isCollapsed, expandedItems, persistState, storageKey]);

    const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed);
    };

    const toggleExpanded = (itemId: string) => {
      setExpandedItems((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        return next;
      });
    };

    const changeMode = (newMode: "full" | "compact" | "icon-only") => {
      setInternalMode(newMode);
      onModeChange?.(newMode);
    };

    const isItemActive = (item: SidebarItem): boolean => {
      if (item.href && pathname === item.href) return true;
      if (item.children) {
        return item.children.some((child) => child.href === pathname);
      }
      return false;
    };

    const renderItem = (item: SidebarItem, depth = 0) => {
      const isActive = isItemActive(item);
      const isExpanded = expandedItems.has(item.id);
      const hasChildren = item.children && item.children.length > 0;

      const content = (
        <>
          {item.icon && (
            <span
              className={cn(
                "flex-shrink-0",
                mode === "icon-only" ? "mx-auto" : ""
              )}
            >
              {item.icon}
            </span>
          )}
          {mode !== "icon-only" && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/70"
                  )}
                >
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isExpanded ? "rotate-180" : ""
                  )}
                />
              )}
            </>
          )}
        </>
      );

      const itemClasses = cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
        "text-white/70 hover:text-white hover:bg-white/10",
        isActive && "bg-primary text-white font-medium",
        item.disabled && "opacity-50 cursor-not-allowed",
        mode === "icon-only" && "justify-center",
        depth > 0 && "ml-4"
      );

      const handleClick = () => {
        if (item.disabled) return;
        if (hasChildren) {
          toggleExpanded(item.id);
        }
        item.onClick?.();
      };

      return (
        <div key={item.id}>
          {item.href && !hasChildren ? (
            <Link
              href={item.href}
              className={itemClasses}
              onClick={() => mobileDrawer && setMobileOpen(false)}
            >
              {content}
            </Link>
          ) : (
            <button
              onClick={handleClick}
              className={cn(itemClasses, "w-full")}
              disabled={item.disabled}
            >
              {content}
            </button>
          )}

          {/* Nested children */}
          {hasChildren && isExpanded && mode !== "icon-only" && (
            <div className="mt-1 space-y-1">
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    };

    const sidebarContent = (
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => renderItem(item))}
      </nav>
    );

    // Mobile drawer
    if (mobileDrawer) {
      return (
        <>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-black/80 backdrop-blur-md text-white"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Mobile drawer */}
          {mobileOpen && (
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            >
              <aside
                ref={ref}
                className={cn(
                  "fixed left-0 top-0 bottom-0 w-64 bg-black/90 backdrop-blur-xl",
                  "border-r border-white/10 flex flex-col",
                  "animate-in slide-in-from-left duration-200",
                  className
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white">Menu</h2>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {sidebarContent}
              </aside>
            </div>
          )}

          {/* Desktop sidebar */}
          <aside
            ref={ref}
            className={cn(
              "hidden lg:flex flex-col bg-black/90 backdrop-blur-xl border-r border-white/10",
              "transition-all duration-300",
              mode === "full" && "w-64",
              mode === "compact" && "w-20",
              mode === "icon-only" && "w-16",
              isCollapsed && "w-16",
              className
            )}
          >
            {/* Header with collapse button */}
            {collapsible && (
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                {mode !== "icon-only" && !isCollapsed && (
                  <h2 className="text-lg font-semibold text-white">
                    Navigation
                  </h2>
                )}
                <button
                  onClick={toggleCollapse}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white ml-auto"
                  aria-label={
                    isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}

            {sidebarContent}

            {/* Mode switcher */}
            {!isCollapsed && (
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <button
                    onClick={() => changeMode("full")}
                    className={cn(
                      "flex-1 px-2 py-1 text-xs rounded",
                      mode === "full"
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    )}
                  >
                    Full
                  </button>
                  <button
                    onClick={() => changeMode("compact")}
                    className={cn(
                      "flex-1 px-2 py-1 text-xs rounded",
                      mode === "compact"
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    )}
                  >
                    Compact
                  </button>
                  <button
                    onClick={() => changeMode("icon-only")}
                    className={cn(
                      "flex-1 px-2 py-1 text-xs rounded",
                      mode === "icon-only"
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    )}
                  >
                    Icons
                  </button>
                </div>
              </div>
            )}
          </aside>
        </>
      );
    }

    // Desktop only (no drawer)
    return (
      <aside
        ref={ref}
        className={cn(
          "flex flex-col bg-black/90 backdrop-blur-xl border-r border-white/10",
          "transition-all duration-300",
          mode === "full" && "w-64",
          mode === "compact" && "w-20",
          mode === "icon-only" && "w-16",
          className
        )}
      >
        {collapsible && (
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            {mode !== "icon-only" && (
              <h2 className="text-lg font-semibold text-white">Navigation</h2>
            )}
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        )}

        {sidebarContent}
      </aside>
    );
  }
);

Sidebar.displayName = "Sidebar";

/**
 * Hook for managing sidebar state
 */
export function useSidebar() {
  const [mode, setMode] = useState<"full" | "compact" | "icon-only">("full");
  const [isOpen, setIsOpen] = useState(false);

  return {
    mode,
    setMode,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
}
