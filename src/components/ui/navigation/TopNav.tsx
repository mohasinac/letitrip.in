/**
 * TopNav Component
 *
 * A sticky header navigation with blur effect, integrated breadcrumbs,
 * search trigger, and notification center.
 *
 * @example
 * ```tsx
 * <TopNav
 *   breadcrumbs={[
 *     { label: 'Dashboard', href: '/dashboard' },
 *     { label: 'Products' }
 *   ]}
 *   onSearchClick={() => openCommandPalette()}
 *   notifications={5}
 *   user={{
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     avatar: '/avatar.jpg'
 *   }}
 * />
 * ```
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, User, Settings, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { BreadcrumbNav, BreadcrumbItem } from "./BreadcrumbNav";

export interface TopNavUser {
  /** User's display name */
  name: string;
  /** User's email */
  email?: string;
  /** Avatar image URL */
  avatar?: string;
  /** Role or title */
  role?: string;
}

export interface TopNavProps {
  /** Breadcrumb items */
  breadcrumbs?: BreadcrumbItem[];
  /** Logo element or text */
  logo?: React.ReactNode;
  /** Logo href */
  logoHref?: string;
  /** Callback when search is clicked */
  onSearchClick?: () => void;
  /** Number of unread notifications */
  notifications?: number;
  /** Callback when notifications clicked */
  onNotificationsClick?: () => void;
  /** Current user info */
  user?: TopNavUser;
  /** User menu items */
  userMenuItems?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "danger";
  }>;
  /** Whether header is sticky */
  sticky?: boolean;
  /** Show blur background */
  blur?: boolean;
  /** Callback for mobile menu button */
  onMobileMenuClick?: () => void;
  /** Additional class name */
  className?: string;
}

export const TopNav = React.forwardRef<HTMLElement, TopNavProps>(
  (
    {
      breadcrumbs,
      logo,
      logoHref = "/",
      onSearchClick,
      notifications = 0,
      onNotificationsClick,
      user,
      userMenuItems = [],
      sticky = true,
      blur = true,
      onMobileMenuClick,
      className,
    },
    ref
  ) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Track scroll position
    useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-user-menu]")) {
          setShowUserMenu(false);
        }
      };

      if (showUserMenu) {
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
      }
    }, [showUserMenu]);

    return (
      <header
        ref={ref}
        className={cn(
          "border-b border-white/10 transition-all duration-200",
          sticky && "sticky top-0 z-40",
          blur && "backdrop-blur-xl",
          scrolled ? "bg-black/90 shadow-lg" : "bg-black/80",
          className
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile menu + Logo + Breadcrumbs */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Mobile menu button */}
              {onMobileMenuClick && (
                <button
                  onClick={onMobileMenuClick}
                  className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {/* Logo */}
              {logo && (
                <Link
                  href={logoHref}
                  className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
                >
                  {logo}
                </Link>
              )}

              {/* Breadcrumbs (hidden on mobile) */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="hidden md:block min-w-0">
                  <BreadcrumbNav
                    items={breadcrumbs}
                    mobileVariant="compact"
                    className="text-white/70"
                  />
                </div>
              )}
            </div>

            {/* Right: Search + Notifications + User */}
            <div className="flex items-center gap-2">
              {/* Search button */}
              {onSearchClick && (
                <button
                  onClick={onSearchClick}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                    "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white",
                    "transition-colors border border-white/10"
                  )}
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Search</span>
                  <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-xs font-mono bg-white/10 rounded">
                    ⌘K
                  </kbd>
                </button>
              )}

              {/* Notifications */}
              {onNotificationsClick && (
                <button
                  onClick={onNotificationsClick}
                  className="relative p-2 rounded-lg hover:bg-white/10 text-white"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {notifications > 9 ? "9+" : notifications}
                    </span>
                  )}
                </button>
              )}

              {/* User menu */}
              {user && (
                <div className="relative" data-user-menu>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 text-white"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="hidden lg:inline text-sm font-medium">
                      {user.name}
                    </span>
                  </button>

                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <div
                      className={cn(
                        "absolute right-0 top-full mt-2 w-64",
                        "bg-black/95 backdrop-blur-xl border border-white/10",
                        "rounded-lg shadow-2xl overflow-hidden",
                        "animate-in fade-in slide-in-from-top-2 duration-200"
                      )}
                    >
                      {/* User info */}
                      <div className="p-4 border-b border-white/10">
                        <p className="font-medium text-white">{user.name}</p>
                        {user.email && (
                          <p className="text-sm text-white/50">{user.email}</p>
                        )}
                        {user.role && (
                          <p className="text-xs text-white/40 mt-1">
                            {user.role}
                          </p>
                        )}
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        {userMenuItems.map((item) => {
                          const content = (
                            <>
                              {item.icon && (
                                <span className="flex-shrink-0">
                                  {item.icon}
                                </span>
                              )}
                              <span className="flex-1">{item.label}</span>
                            </>
                          );

                          const itemClasses = cn(
                            "flex items-center gap-3 px-4 py-2.5 w-full",
                            "transition-colors",
                            item.variant === "danger"
                              ? "text-error hover:bg-error/10"
                              : "text-white/70 hover:text-white hover:bg-white/10"
                          );

                          return item.href ? (
                            <Link
                              key={item.id}
                              href={item.href}
                              className={itemClasses}
                              onClick={() => setShowUserMenu(false)}
                            >
                              {content}
                            </Link>
                          ) : (
                            <button
                              key={item.id}
                              onClick={() => {
                                item.onClick?.();
                                setShowUserMenu(false);
                              }}
                              className={itemClasses}
                            >
                              {content}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }
);

TopNav.displayName = "TopNav";

/**
 * Hook for managing TopNav state
 */
export function useTopNav() {
  const [notifications, setNotifications] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  return {
    notifications,
    setNotifications,
    showSearch,
    openSearch: () => setShowSearch(true),
    closeSearch: () => setShowSearch(false),
  };
}
