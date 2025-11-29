"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Layers,
  Star,
  BookOpen,
  Store,
  Gavel,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "home", name: "Home", href: "/", icon: Home },
  { id: "products", name: "Products", href: "/products", icon: ShoppingBag },
  { id: "auctions", name: "Auctions", href: "/auctions", icon: Gavel },
  { id: "shops", name: "Shops", href: "/shops", icon: Store },
  { id: "categories", name: "Categories", href: "/categories", icon: Layers },
  { id: "reviews", name: "Reviews", href: "/reviews", icon: Star },
  { id: "blog", name: "Blog", href: "/blog", icon: BookOpen },
];

/**
 * SubNavbar - Secondary navigation bar
 * Hidden on mobile (< lg breakpoint) as MobileSidebar provides navigation
 * Shows on desktop with dark mode support
 */
export default function SubNavbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-[52px] z-40"
      aria-label="Secondary navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8 py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors min-h-[44px] ${
                  active
                    ? "text-yellow-600 dark:text-yellow-500 border-b-2 border-yellow-600 dark:border-yellow-500"
                    : "text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-500"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
