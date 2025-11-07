"use client";

import React from "react";
import Link from "next/link";
import { Bell, Menu, Search, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function SellerHeader() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Left: Mobile Menu + Search */}
        <div className="flex flex-1 items-center gap-4">
          <button
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>

          <div className="hidden w-96 lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search products, orders..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Notifications + User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6 text-gray-600" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email?.split("@")[0] || "Seller"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || "seller"}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-200 px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || user?.email?.split("@")[0] || "Seller"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="py-2">
                  <Link
                    href="/seller/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link
                    href="/user/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
