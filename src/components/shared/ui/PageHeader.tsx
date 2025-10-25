"use client";

import { useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAuth } from "@/hooks/useAuth";
import Breadcrumb from "./Breadcrumb";
import QuickNavigation from "./QuickNavigation";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { getRouteGroup, ROUTE_GROUPS } from "@/constants/routes";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  showBreadcrumbs?: boolean;
  showQuickNav?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  showBreadcrumbs = true,
  showQuickNav = true,
  children,
  className = "",
}: PageHeaderProps) {
  const { currentRoute, getNavigationTitle } = useNavigation();
  const { user } = useAuth();
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const routeGroup = getRouteGroup(currentRoute);
  const displayTitle = title || getNavigationTitle();
  const userRole = user?.role;

  const getHeaderStyles = () => {
    switch (routeGroup) {
      case ROUTE_GROUPS.ADMIN:
        return "bg-gradient-to-r from-red-600 to-red-700 text-white";
      case ROUTE_GROUPS.SELLER:
        return "bg-gradient-to-r from-purple-600 to-purple-700 text-white";
      case ROUTE_GROUPS.ACCOUNT:
        return "bg-gradient-to-r from-blue-600 to-blue-700 text-white";
      case ROUTE_GROUPS.SHOP:
        return "bg-gradient-to-r from-green-600 to-green-700 text-white";
      default:
        return "bg-white border-b border-gray-200 text-gray-900";
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case "admin":
        return "Admin Panel";
      case "seller":
        return "Seller Dashboard";
      case "user":
        return "My Account";
      default:
        return "";
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-40 ${getHeaderStyles()} ${className}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold truncate">
                  {displayTitle}
                </h1>
                {userRole && userRole !== "user" && (
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                    {getRoleLabel()}
                  </span>
                )}
              </div>
              {subtitle && (
                <span className="hidden md:block text-sm opacity-75">
                  {subtitle}
                </span>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Search (for larger screens) */}
              <div className="hidden lg:block">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-75 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* Quick Navigation Toggle */}
              {showQuickNav && (
                <button
                  onClick={() => setIsQuickNavOpen(true)}
                  className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                >
                  <Bars3Icon className="h-5 w-5" />
                </button>
              )}

              {/* User Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Profile Settings
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Breadcrumbs */}
          {showBreadcrumbs && (
            <div className="pb-4">
              <Breadcrumb className="bg-white bg-opacity-10 border-white border-opacity-20" />
            </div>
          )}

          {/* Custom Content */}
          {children && <div className="pb-4">{children}</div>}
        </div>
      </header>

      {/* Quick Navigation Panel */}
      <QuickNavigation
        isOpen={isQuickNavOpen}
        onClose={() => setIsQuickNavOpen(false)}
      />

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
}
