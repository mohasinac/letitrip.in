"use client";

import React, { useState } from "react";
import {
  Menu,
  ShoppingCart,
  Search,
  User,
  Sun,
  Moon,
  LogIn,
  LogOut,
  UserCircle,
  X,
} from "lucide-react";
import { useModernTheme } from "@/contexts/ModernThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import ClientOnly from "@/components/shared/ClientOnly";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { useIsAdminRoute } from "@/hooks/useIsAdminRoute";
import { usePathname } from "next/navigation";

interface ModernLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/categories" },
  { name: "Game", href: "/game" },
  { name: "Contact", href: "/contact" },
];

export default function ModernLayout({ children }: ModernLayoutProps) {
  const { mode, toggleTheme } = useModernTheme();
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(true);
  const [sellerSidebarOpen, setSellerSidebarOpen] = useState(true);
  const isAdminRoute = useIsAdminRoute();
  const isSellerRoute = pathname?.startsWith("/seller") || false;

  const handleDrawerToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleProfileMenuClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const drawer = (
    <nav className="w-64 p-4">
      <ul className="space-y-2">
        {navigation.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {item.name}
            </Link>
          </li>
        ))}
        <li className="border-t border-gray-200 dark:border-gray-700 my-2"></li>
        {/* Mobile Auth Links */}
        {user ? (
          <>
            <li>
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Profile
              </Link>
            </li>
            {user.role === "admin" && (
              <li>
                <Link
                  href="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Admin Panel
                </Link>
              </li>
            )}
            {(user.role === "seller" || user.role === "admin") && (
              <li>
                <Link
                  href="/seller/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Seller Panel
                </Link>
              </li>
            )}
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );

  return (
    <div
      className={`flex min-h-screen ${
        isAdminRoute || isSellerRoute ? "flex-row" : "flex-col"
      }`}
    >
      {/* Admin Sidebar - Only show on admin routes */}
      {isAdminRoute && (
        <AdminSidebar open={adminSidebarOpen} onToggle={setAdminSidebarOpen} />
      )}

      {/* Seller Sidebar - Only show on seller routes */}
      {isSellerRoute && (
        <SellerSidebar
          open={sellerSidebarOpen}
          onToggle={setSellerSidebarOpen}
        />
      )}

      <div className="flex flex-col flex-grow w-full">
        {/* Header */}
        <header className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-3">
              {/* Mobile menu button - only show on mobile */}
              <div className="flex md:hidden w-12 justify-start">
                <button
                  onClick={handleDrawerToggle}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="open drawer"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>

              {/* Logo */}
              <Link
                href="/"
                className="font-bold text-gray-900 dark:text-white no-underline text-xl md:text-2xl flex-grow md:flex-grow-0 text-center md:text-left"
              >
                HobbiesSpot
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-2 text-gray-900 dark:text-white font-medium rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Right Section - Icons and Auth */}
              <div className="flex items-center gap-2">
                <ClientOnly>
                  {user ? (
                    <>
                      {/* User Profile Menu */}
                      <div className="relative">
                        <button
                          onClick={handleProfileMenuOpen}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <UserCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        </button>

                        {/* Custom Dropdown Menu */}
                        {Boolean(profileMenuAnchor) && (
                          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                            <Link
                              href="/profile"
                              onClick={handleProfileMenuClose}
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                {user.name
                                  ? user.name.charAt(0).toUpperCase()
                                  : "U"}
                              </div>
                              <span>Profile</span>
                            </Link>
                            {user.role === "admin" && (
                              <Link
                                href="/admin"
                                onClick={handleProfileMenuClose}
                                className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                              >
                                <UserCircle className="h-5 w-5" />
                                <span>Admin Panel</span>
                              </Link>
                            )}
                            {(user.role === "seller" ||
                              user.role === "admin") && (
                              <Link
                                href="/seller/dashboard"
                                onClick={handleProfileMenuClose}
                                className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                              >
                                <UserCircle className="h-5 w-5" />
                                <span>Seller Panel</span>
                              </Link>
                            )}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                            >
                              <LogOut className="h-5 w-5" />
                              <span>Logout</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:border-blue-500 transition-colors no-underline"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Link>
                      <Link
                        href="/login"
                        className="flex sm:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <User className="h-5 w-5" />
                      </Link>
                    </>
                  )}
                </ClientOnly>

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {mode === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={handleDrawerToggle}
            ></div>
            {/* Drawer */}
            <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-xl">
              {drawer}
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  HobbiesSpot
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your premium destination for authentic Beyblades and hobby
                  collectibles. Quality guaranteed.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Quick Links
                </h3>
                <div className="flex flex-col gap-2">
                  {navigation.slice(0, 5).map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Categories
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "Beyblade Burst", href: "/game" },
                    { name: "Metal Series", href: "/game" },
                    { name: "Plastic Gen", href: "/game" },
                    { name: "Accessories", href: "/game" },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Support
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "Contact", href: "/contact" },
                    { name: "Terms", href: "/terms" },
                    { name: "Privacy", href: "/privacy" },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 HobbiesSpot. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
