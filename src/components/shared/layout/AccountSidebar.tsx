"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ClockIcon,
  ShoppingCartIcon,
  HeartIcon,
  ArrowUturnLeftIcon,
  StarIcon,
  BellIcon,
  CogIcon,
  TruckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getAccountNavigation } from "@/utils/navigation";

interface AccountSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AccountSidebar({
  isOpen = true,
  onClose,
}: AccountSidebarProps) {
  const pathname = usePathname();
  const navigationItems = getAccountNavigation();

  const getIcon = (href: string) => {
    if (href.includes("dashboard")) return HomeIcon;
    if (href.includes("profile")) return UserIcon;
    if (href.includes("addresses")) return MapPinIcon;
    if (href.includes("orders") && !href.includes("track"))
      return ShoppingBagIcon;
    if (href.includes("track")) return ClockIcon;
    if (href.includes("cart")) return ShoppingCartIcon;
    if (href.includes("wishlist")) return HeartIcon;
    if (href.includes("returns")) return ArrowUturnLeftIcon;
    if (href.includes("reviews")) return StarIcon;
    if (href.includes("notifications")) return BellIcon;
    if (href.includes("shipping")) return TruckIcon;
    if (href.includes("settings")) return CogIcon;
    return HomeIcon;
  };

  const isActive = (href: string) => {
    if (href === "/(account)" && pathname === "/(account)") return true;
    if (href !== "/(account)" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 
          bg-background border-r border-border 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              My Account
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = getIcon(item.href);
              const active = isActive(item.href);

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }
                    `}
                    onClick={onClose}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <div>{item.label}</div>
                      {item.description && (
                        <div
                          className={`text-xs mt-0.5 ${
                            active
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Sub-navigation */}
                  {item.children && active && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={onClose}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              Need help?{" "}
              <Link href="/help" className="text-primary hover:underline">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
