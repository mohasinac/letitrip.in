"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Sun,
  Moon,
  LogIn,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useModernTheme } from "@/contexts/ModernThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import Link from "next/link";
import ClientOnly from "@/components/shared/ClientOnly";
import UnifiedSidebar from "@/components/layout/UnifiedSidebar";
import { usePathname } from "next/navigation";
import FloatingCart from "@/components/cart/FloatingCart";

interface ModernLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "Contact", href: "/contact" },
];

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

export default function ModernLayout({ children }: ModernLayoutProps) {
  const { mode, toggleTheme } = useModernTheme();
  const { user, loading } = useAuth();
  const { currency: contextCurrency, setCurrency } = useCurrency();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Sync selected currency with context
  const selectedCurrency = currencies.find(c => c.code === contextCurrency) || currencies[3]; // Default to INR

  const isAdminRoute = pathname?.startsWith("/admin") || false;
  const isSellerRoute = pathname?.startsWith("/seller") || false;
  const shouldShowSidebar = user && (isAdminRoute || isSellerRoute || user);
  
  const handleCurrencyChange = async (currencyCode: string) => {
    await setCurrency(currencyCode, user?.id);
    setCurrencyMenuOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setSearchQuery("");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
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
              onClick={handleDrawerToggle}
            >
              {item.name}
            </Link>
          </li>
        ))}
        <li className="border-t border-gray-200 dark:border-gray-700 my-2"></li>
        {!user && (
          <li>
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={handleDrawerToggle}
            >
              Sign In
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );

  return (
    <div
      className={`flex min-h-screen ${
        shouldShowSidebar ? "flex-row" : "flex-col"
      }`}
    >
      {/* Unified Sidebar - Shown for logged-in users */}
      {shouldShowSidebar && (
        <ClientOnly>
          <UnifiedSidebar open={sidebarOpen} onToggle={setSidebarOpen} />
        </ClientOnly>
      )}

      <div className="flex flex-col flex-grow w-full">
        {/* Header */}
        <header className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-3 gap-4">
              {/* Left: Mobile menu + Logo */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDrawerToggle}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
                  aria-label="open drawer"
                >
                  <Menu className="h-6 w-6" />
                </button>

                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-gray-900 dark:text-white no-underline text-xl md:text-2xl flex-shrink-0"
                >
                  <span className="text-2xl">🎯</span>
                  <span>HobbiesSpot</span>
                </Link>
              </div>

              {/* Right: Navigation + Actions */}
              <div className="flex items-center gap-2 md:gap-4">
                {/* Desktop Navigation */}
                <nav className="hidden lg:flex gap-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 no-underline ${
                        pathname === item.href
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Currency Selector */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{selectedCurrency.code}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {currencyMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setCurrencyMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                        {currencies.map((currency) => (
                          <button
                            key={currency.code}
                            onClick={() => handleCurrencyChange(currency.code)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              selectedCurrency.code === currency.code
                                ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <span className="font-mono">{currency.symbol}</span>{" "}
                            {currency.code} - {currency.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearchToggle}
                  className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="search"
                >
                  <Search className="h-5 w-5" />
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="toggle theme"
                >
                  {mode === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>

                {/* Sign In Button (only when not logged in) */}
                {!user && !loading && (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium no-underline"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden md:inline">Sign In</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Search Bar (shown when search is open) */}
            {searchOpen && (
              <div className="py-4 border-t border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products, categories..."
                      className="w-full px-4 py-3 pr-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                      <button
                        type="button"
                        onClick={handleSearchToggle}
                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={handleDrawerToggle}
            ></div>
            <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-xl">
              {drawer}
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Floating Cart */}
        <ClientOnly>
          <FloatingCart />
        </ClientOnly>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <Link
                  href="/"
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400 no-underline flex items-center gap-2"
                >
                  <span className="text-2xl">🎯</span>
                  <span>HobbiesSpot</span>
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
                      className="h-6 w-6"
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
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg
                      className="h-6 w-6"
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
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Shop
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "All Products", href: "/products" },
                    { name: "Categories", href: "/categories" },
                    { name: "New Arrivals", href: "/products?sort=newest" },
                    { name: "Best Sellers", href: "/products?sort=popular" },
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

              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Help
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "Contact Us", href: "/contact" },
                    { name: "FAQ", href: "/faq" },
                    { name: "Track Order", href: "/account/track-order" },
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

              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  About
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "About Us", href: "/about" },
                    { name: "Terms", href: "/terms" },
                    { name: "Privacy", href: "/privacy" },
                    { name: "Cookies", href: "/cookies" },
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
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
