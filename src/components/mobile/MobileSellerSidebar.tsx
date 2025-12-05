/**
 * @fileoverview React Component
 * @module src/components/mobile/MobileSellerSidebar
 * @description This file contains the MobileSellerSidebar component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  RotateCcw,
  Ticket,
  BarChart3,
  DollarSign,
  Star,
  Gavel,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * NavItem interface
 * 
 * @interface
 * @description Defines the structure and contract for NavItem
 */
interface NavItem {
  /** Title */
  title: string;
  /** Href */
  href: string;
  /** Icon */
  icon: React.ComponentType<{ className?: string }>;
  /** Badge */
  badge?: string;
  /** Children */
  children?: NavItem[];
}

/**
 * Performs navigation operation
 *
 * @returns {any} The navigation result
 *
 */
const navigation: NavItem[] = [
  {
    /** Title */
    title: "Dashboard",
    /** Href */
    href: "/seller",
    /** Icon */
    icon: LayoutDashboard,
  },
  {
    /** Title */
    title: "My Shops",
    /** Href */
    href: "/seller/my-shops",
    /** Icon */
    icon: Store,
  },
  {
    /** Title */
    title: "Products",
    /** Href */
    href: "/seller/products",
    /** Icon */
    icon: Package,
    /** Children */
    children: [
      { title: "All Products", href: "/seller/products", icon: Package },
      { title: "Add Product", href: "/seller/products/add", icon: Plus },
    ],
  },
  {
    /** Title */
    title: "Auctions",
    /** Href */
    href: "/seller/auctions",
    /** Icon */
    icon: Gavel,
    /** Children */
    children: [
      { title: "All Auctions", href: "/seller/auctions", icon: Gavel },
      { title: "Create Auction", href: "/seller/auctions/create", icon: Plus },
    ],
  },
  {
    /** Title */
    title: "Orders",
    /** Href */
    href: "/seller/orders",
    /** Icon */
    icon: ShoppingCart,
  },
  {
    /** Title */
    title: "Returns & Refunds",
    /** Href */
    href: "/seller/returns",
    /** Icon */
    icon: RotateCcw,
  },
  {
    /** Title */
    title: "Revenue",
    /** Href */
    href: "/seller/revenue",
    /** Icon */
    icon: DollarSign,
  },
  {
    /** Title */
    title: "Analytics",
    /** Href */
    href: "/seller/analytics",
    /** Icon */
    icon: BarChart3,
  },
  {
    /** Title */
    title: "Reviews",
    /** Href */
    href: "/seller/reviews",
    /** Icon */
    icon: Star,
  },
  {
    /** Title */
    title: "Coupons",
    /** Href */
    href: "/seller/coupons",
    /** Icon */
    icon: Ticket,
  },
];

/**
 * MobileSellerSidebarProps interface
 * 
 * @interface
 * @description Defines the structure and contract for MobileSellerSidebarProps
 */
interface MobileSellerSidebarProps {
  /** Is Open */
  isOpen: boolean;
  /** On Close */
  onClose: () => void;
}

/**
 * Function: Mobile Seller Sidebar
 */
/**
 * Performs mobile seller sidebar operation
 *
 * @param {MobileSellerSidebarProps} {
  isOpen,
  onClose,
} - The {
  is open,
  on close,
}
 *
 * @returns {any} The mobilesellersidebar result
 *
 * @example
 * MobileSellerSidebar({
  isOpen,
  onClose,
});
 */

/**
 * Performs mobile seller sidebar operation
 *
 * @param {MobileSellerSidebarProps} {
  isOpen,
  onClose,
} - The {
  is open,
  on close,
}
 *
 * @returns {any} The mobilesellersidebar result
 *
 * @example
 * MobileSellerSidebar({
  isOpen,
  onClose,
});
 */

/**
 * Performs mobile seller sidebar operation
 *
 * @param {MobileSellerSidebarProps} {
  isOpen,
  onClose,
} - The {
  isopen,
  onclose,
}
 *
 * @returns {any} The mobilesellersidebar result
 *
 * @example
 * MobileSellerSidebar({
  isOpen,
  onClose,
});
 */
export function MobileSellerSidebar({
  isOpen,
  onClose,
}: MobileSellerSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";/**
 * Performs active section operation
 *
 * @param {any} (item - The (item
 *
 * @returns {any} The activesection result
 *
 */

    };
  }, [isOpen]);

  // Auto-expand active section
  useEffect(() => {
    const activeSection = navigation.find((item) =>
      item.children?.some(
        (child) => child.href && pathname.startsWith(child.href),
      ),
    );
    if (activeSection) {
      setExpandedItems((prev) =>
        prev.includes(activeSection.title)
          ? prev
          : [...prev, activeSection.title],
      );
    }
  }, [pathname]);

  /**
   * Performs toggle item operation
   *
   * @param {string} title - The title
   *
   * @returns {string} The toggleitem result
   */

  /**
   * Performs toggle item operation
   *
   * @param {string} title - The title
   *
   * @returns {string} The toggleitem result
   */

  const toggleItem = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  /**
   * Checks if active
   *
   * @param {string} href - The href
   *
   * @returns {string} The isactive result
   */

  /**
   * Checks if active
   *
   * @param {string} href - The href
   *
   * @returns {string} The isactive result
   */

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-[60] lg:hidden flex flex-col animate-slide-in-left"
        role="dialog"
        aria-modal="true"
        aria-label="Seller navigation"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
          <Link
            href="/seller"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <Store className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Seller Hub
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg touch-target"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/seller/products/add"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 touch-target"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
            <Link
              href="/seller/auctions/create"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-gray-700 active:bg-blue-100 dark:active:bg-gray-600 touch-target"
            >
              <Gavel className="w-4 h-4" />
              Auction
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-/**
 * Checks if has active child
 *
 * @param {any} (child - The (child
 *
 * @returns {any} The hasactivechild result
 *
 */
4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const expanded = expandedItems.includes(item.title);
            const hasActiveChild = item.children?.some(
              (child) => child.href && isActive(child.href),
            );

            return (
              <div key={item.title}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.children) {
                      e.preventDefault();
                      toggleItem(item.title);
                    } else {
                      onClose();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors touch-target",
                    active || hasActiveChild
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      active || hasActiveChild
                        ? "text-blue-600 dark:text-blue-500"
                        : "text-gray-400 dark:text-gray-500",
                    )}
                  />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="rounded-full bg-red-100 dark:bg-red-900/50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
                      {item.badge}
                    </span>
                  )}
                  {item.children && (
                    <div>
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                  )}
                </Link>

                {/* Submenu */}
                {item.children && expanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.href);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors touch-target",
                            childActive
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700",
                          )}
                        >
                          <ChildIcon
                            className={cn(
                              "h-4 w-4 flex-shrink-0",
                              childActive
                                ? "text-blue-600 dark:text-blue-500"
                                : "text-gray-400 dark:text-gray-500",
                            )}
                          />
                          <span>{child.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 pb-safe">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 touch-target"
          >
            <svg
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
