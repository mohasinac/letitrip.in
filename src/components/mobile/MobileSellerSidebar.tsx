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

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/seller",
    icon: LayoutDashboard,
  },
  {
    title: "My Shops",
    href: "/seller/my-shops",
    icon: Store,
  },
  {
    title: "Products",
    href: "/seller/products",
    icon: Package,
    children: [
      { title: "All Products", href: "/seller/products", icon: Package },
      { title: "Add Product", href: "/seller/products/add", icon: Plus },
    ],
  },
  {
    title: "Auctions",
    href: "/seller/auctions",
    icon: Gavel,
    children: [
      { title: "All Auctions", href: "/seller/auctions", icon: Gavel },
      { title: "Create Auction", href: "/seller/auctions/create", icon: Plus },
    ],
  },
  {
    title: "Orders",
    href: "/seller/orders",
    icon: ShoppingCart,
  },
  {
    title: "Returns & Refunds",
    href: "/seller/returns",
    icon: RotateCcw,
  },
  {
    title: "Revenue",
    href: "/seller/revenue",
    icon: DollarSign,
  },
  {
    title: "Analytics",
    href: "/seller/analytics",
    icon: BarChart3,
  },
  {
    title: "Reviews",
    href: "/seller/reviews",
    icon: Star,
  },
  {
    title: "Coupons",
    href: "/seller/coupons",
    icon: Ticket,
  },
];

interface MobileSellerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

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
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-expand active section
  useEffect(() => {
    const activeSection = navigation.find((item) =>
      item.children?.some(
        (child) => child.href && pathname.startsWith(child.href)
      )
    );
    if (activeSection) {
      setExpandedItems((prev) =>
        prev.includes(activeSection.title)
          ? prev
          : [...prev, activeSection.title]
      );
    }
  }, [pathname]);

  const toggleItem = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

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
        className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[60] lg:hidden flex flex-col animate-slide-in-left"
        role="dialog"
        aria-modal="true"
        aria-label="Seller navigation"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <Link
            href="/seller"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <Store className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              Seller Hub
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg touch-target"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200 bg-blue-50">
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
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-blue-600 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 active:bg-blue-100 touch-target"
            >
              <Gavel className="w-4 h-4" />
              Auction
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const expanded = expandedItems.includes(item.title);
            const hasActiveChild = item.children?.some(
              (child) => child.href && isActive(child.href)
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
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      active || hasActiveChild
                        ? "text-blue-600"
                        : "text-gray-400"
                    )}
                  />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {item.badge}
                    </span>
                  )}
                  {item.children && (
                    <div>
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
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
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                          )}
                        >
                          <ChildIcon
                            className={cn(
                              "h-4 w-4 flex-shrink-0",
                              childActive ? "text-blue-600" : "text-gray-400"
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
        <div className="border-t border-gray-200 p-4 pb-safe">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 touch-target"
          >
            <svg
              className="h-5 w-5 text-gray-400"
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
