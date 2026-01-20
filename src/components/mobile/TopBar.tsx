/**
 * TopBar Component - Phase 7.1
 *
 * Persistent top bar for mobile with logo and search icon.
 * Always visible on scroll for quick access.
 *
 * Features:
 * - Fixed top positioning on mobile
 * - Logo on left, search icon on right
 * - Transparent on scroll up, visible on scroll down
 * - Quick search modal trigger
 * - Dark mode support
 * - iOS safe area inset support
 *
 * Usage:
 * - Place in root layout header
 * - Shows on all pages (mobile only)
 * - Persists across navigation
 */

"use client";

import { cn } from "@/lib/utils";
import { Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TopBarProps {
  onMenuToggle?: () => void;
  showMenuIcon?: boolean;
}

export function TopBar({ onMenuToggle, showMenuIcon = false }: TopBarProps) {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Top Bar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "bg-white dark:bg-gray-900",
          "pt-safe", // iOS safe area inset
          "lg:hidden", // Hidden on desktop
          "transition-shadow duration-200",
          isScrolled && "shadow-md",
        )}
        role="banner"
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Menu Icon (optional) */}
          {showMenuIcon && (
            <button
              onClick={onMenuToggle}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg active:scale-95 transition-all"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            aria-label="Go to homepage"
          >
            <Image
              src="/logo.svg"
              alt="LetItRip"
              width={120}
              height={32}
              className="h-8 w-auto dark:invert"
              priority
            />
          </Link>

          {/* Search Icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 -mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg active:scale-95 transition-all"
            aria-label="Open search"
          >
            <Search className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black bg-opacity-50 animate-in fade-in duration-200 lg:hidden"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-900 pt-safe pb-4 shadow-xl animate-in slide-in-from-top duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4">
              {/* Search Header */}
              <div className="flex items-center justify-between h-14 mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Search
                </h2>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 -mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg active:scale-95 transition-all"
                  aria-label="Close search"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, auctions, shops..."
                  className="w-full h-12 pl-12 pr-4 text-base border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  aria-label="Search"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </form>

              {/* Recent Searches (Optional - can add later) */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Type to search across products, auctions, and shops
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
