"use client";

import {
  Bars3Icon,
  BuildingStorefrontIcon,
  GiftIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  GiftIcon as GiftIconSolid,
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  activeIcon: React.ComponentType<any>;
  badge?: number;
}

interface MobileNavigationProps {
  LinkComponent?: React.ComponentType<any>;
  cartCount?: number;
  className?: string;
}

export function MobileNavigation({
  LinkComponent = Link,
  cartCount = 0,
  className = "",
}: MobileNavigationProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      label: "Home",
      href: "/",
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      label: "Search",
      href: "/search",
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid,
    },
    {
      label: "Auctions",
      href: "/buy-auction-all",
      icon: GiftIcon,
      activeIcon: GiftIconSolid,
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingCartIcon,
      activeIcon: ShoppingCartIconSolid,
      badge: cartCount,
    },
    {
      label: "Account",
      href: "/user/profile",
      icon: UserIcon,
      activeIcon: UserIconSolid,
    },
  ];

  const menuItems = [
    { label: "Products", href: "/buy-product-all", icon: ShoppingBagIcon },
    { label: "Auctions", href: "/buy-auction-all", icon: GiftIcon },
    { label: "Shops", href: "/shops", icon: BuildingStorefrontIcon },
    { label: "Categories", href: "/categories", icon: Bars3Icon },
    { label: "Cart", href: "/cart", icon: ShoppingCartIcon, badge: cartCount },
    { label: "Profile", href: "/user/profile", icon: UserIcon },
    { label: "Orders", href: "/user/orders", icon: ShoppingBagIcon },
    { label: "Wishlist", href: "/user/wishlist", icon: GiftIcon },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40 md:hidden ${className}`}
      >
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = active ? item.activeIcon : item.icon;

            return (
              <LinkComponent
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                <div className="relative">
                  <IconComponent className="w-6 h-6" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </LinkComponent>
            );
          })}
        </div>
      </div>

      {/* Hamburger Menu Button (for additional items) */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-4 right-4 z-50 md:hidden bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Overlay Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Menu
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <LinkComponent
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          active
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="relative">
                          <item.icon className="w-5 h-5" />
                          {item.badge && item.badge > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {item.badge > 9 ? "9+" : item.badge}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </LinkComponent>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Spacer for bottom navigation */}
      <div className="h-16 md:hidden" />
    </>
  );
}

export default MobileNavigation;
