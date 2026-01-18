"use client";

import {
  Banknote,
  BarChart3,
  ChevronDown,
  ChevronRight,
  CreditCard,
  DollarSign,
  FolderTree,
  Gavel,
  Home,
  Image,
  LayoutDashboard,
  Layout as LayoutIcon,
  LifeBuoy,
  Newspaper,
  Package,
  RotateCcw,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Store,
  Ticket,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import React, { ComponentType, ReactNode, useEffect, useState } from "react";
import { cn } from "../../utils/cn";

export interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

export const defaultAdminNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Overview",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Content Management",
    icon: LayoutIcon,
    children: [
      { title: "Homepage Settings", href: "/admin/homepage", icon: Home },
      { title: "Hero Slides", href: "/admin/hero-slides", icon: Image },
      { title: "Categories", href: "/admin/categories", icon: FolderTree },
    ],
  },
  {
    title: "Marketplace",
    icon: Store,
    children: [
      { title: "All Shops", href: "/admin/shops", icon: Store },
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "All Auctions", href: "/admin/auctions", icon: Gavel },
      { title: "Live Auctions", href: "/admin/auctions/live", icon: Gavel },
    ],
  },
  {
    title: "User Management",
    icon: Users,
    children: [
      { title: "All Users", href: "/admin/users", icon: Users },
      { title: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "Transactions",
    icon: CreditCard,
    children: [
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { title: "Payments", href: "/admin/payments", icon: CreditCard },
      { title: "Seller Payouts", href: "/admin/payouts", icon: Banknote },
      { title: "Coupons", href: "/admin/coupons", icon: Ticket },
      { title: "Returns & Refunds", href: "/admin/returns", icon: RotateCcw },
    ],
  },
  {
    title: "Support",
    icon: LifeBuoy,
    children: [
      { title: "All Tickets", href: "/admin/support-tickets", icon: LifeBuoy },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    children: [
      { title: "Overview", href: "/admin/analytics", icon: TrendingUp },
      { title: "Sales", href: "/admin/analytics/sales", icon: DollarSign },
    ],
  },
  {
    title: "Blog",
    icon: Newspaper,
    children: [{ title: "All Posts", href: "/admin/blog", icon: Newspaper }],
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "General", href: "/admin/settings/general", icon: Settings },
    ],
  },
];

export interface MobileAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  navigation?: NavItem[];
  LinkComponent: ComponentType<{
    href: string;
    onClick?: () => void;
    className?: string;
    children: ReactNode;
  }>;
}

export function MobileAdminSidebar({
  isOpen,
  onClose,
  currentPath,
  navigation = defaultAdminNavigation,
  LinkComponent,
}: MobileAdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-expand active section
  useEffect(() => {
    if (!currentPath) return;
    const activeSection = navigation.find((item) =>
      item.children?.some(
        (child) => child.href && currentPath.startsWith(child.href)
      )
    );
    if (activeSection) {
      setExpandedItems((prev) =>
        prev.includes(activeSection.title)
          ? prev
          : [...prev, activeSection.title]
      );
    }
  }, [currentPath, navigation]);

  const toggleItem = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (!currentPath) return false;
    return currentPath === href || currentPath.startsWith(href + "/");
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
        aria-label="Admin navigation"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
          <LinkComponent
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <Shield className="h-6 w-6 text-purple-600 dark:text-purple-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Panel
            </span>
          </LinkComponent>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg touch-target"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href ? isActive(item.href) : false;
            const expanded = expandedItems.includes(item.title);
            const hasActiveChild = item.children?.some(
              (child) => child.href && isActive(child.href)
            );

            return (
              <div key={item.title}>
                {item.href ? (
                  <LinkComponent
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors touch-target",
                      active
                        ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        active
                          ? "text-yellow-600 dark:text-yellow-500"
                          : "text-gray-400 dark:text-gray-500"
                      )}
                    />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="rounded-full bg-red-100 dark:bg-red-900/50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
                        {item.badge}
                      </span>
                    )}
                  </LinkComponent>
                ) : (
                  <button
                    onClick={() => toggleItem(item.title)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors touch-target",
                      hasActiveChild
                        ? "text-yellow-700 dark:text-yellow-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        hasActiveChild
                          ? "text-yellow-600 dark:text-yellow-500"
                          : "text-gray-400 dark:text-gray-500"
                      )}
                    />
                    <span className="flex-1 text-left">{item.title}</span>
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                )}

                {/* Submenu */}
                {item.children && expanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = child.href
                        ? isActive(child.href)
                        : false;

                      return child.href ? (
                        <LinkComponent
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors touch-target",
                            childActive
                              ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                          )}
                        >
                          <ChildIcon
                            className={cn(
                              "h-4 w-4 flex-shrink-0",
                              childActive
                                ? "text-yellow-600 dark:text-yellow-500"
                                : "text-gray-400 dark:text-gray-500"
                            )}
                          />
                          <span>{child.title}</span>
                        </LinkComponent>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 pb-safe">
          <LinkComponent
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
          </LinkComponent>
        </div>
      </aside>
    </>
  );
}

