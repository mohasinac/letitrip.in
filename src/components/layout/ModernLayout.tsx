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
import FloatingCart from "@/components/cart/FloatingCart";

interface ModernLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "Stores", href: "/stores" },
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
              <nav className="hidden lg:flex gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 no-underline ${
                      pathname === item.href
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Right Section - Search, Cart, and Auth */}
              <div className="flex items-center gap-2">
                {/* Search Icon */}
                <Link
                  href="/search"
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Search"
                >
                  <Search className="h-5 w-5" />
                </Link>

                {/* Shopping Cart */}
                <Link
                  href="/cart"
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {/* Cart Badge - You can make this dynamic later */}
                  {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span> */}
                </Link>
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

        {/* Floating Cart Button */}
        <FloatingCart />

        {/* Footer */}
        <footer className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <Link
                  href="/"
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400 no-underline"
                >
                  HobbiesSpot
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 max-w-sm">
                  Your premium destination for authentic Beyblades,
                  collectibles, and hobby products. Shop with confidence -
                  Quality guaranteed, worldwide shipping available.
                </p>
                <div className="flex gap-4 mt-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Shop */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Shop
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "All Products", href: "/products" },
                    { name: "Categories", href: "/categories" },
                    { name: "Stores", href: "/stores" },
                    { name: "New Arrivals", href: "/products?sort=newest" },
                    { name: "Best Sellers", href: "/products?sort=popular" },
                    { name: "On Sale", href: "/products?sale=true" },
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

              {/* Customer Service */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Customer Service
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "Contact Us", href: "/contact" },
                    { name: "Help Center", href: "/help" },
                    { name: "FAQ", href: "/faq" },
                    { name: "Track Order", href: "/account/orders" },
                    { name: "Returns", href: "/account/returns" },
                    { name: "Shipping Info", href: "/shipping" },
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

              {/* Company */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Company
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "About Us", href: "/about" },
                    { name: "Careers", href: "/careers" },
                    { name: "Blog", href: "/blog" },
                    { name: "Beyblade Game", href: "/game" },
                    { name: "Terms of Service", href: "/terms" },
                    { name: "Privacy Policy", href: "/privacy" },
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

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 dark:border-gray-700 mt-10 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
                  © 2025 HobbiesSpot. All rights reserved. Made with ❤️ for
                  collectors worldwide.
                </p>
                <div className="flex gap-6">
                  <Link
                    href="/sitemap"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                  >
                    Sitemap
                  </Link>
                  <Link
                    href="/accessibility"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                  >
                    Accessibility
                  </Link>
                  <Link
                    href="/cookies"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
