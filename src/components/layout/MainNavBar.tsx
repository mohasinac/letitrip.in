"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Gift,
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
  Search,
} from "lucide-react";
import { COMPANY_NAME, USER_MENU_ITEMS } from "@/constants/navigation";

export default function MainNavBar({
  onMobileMenuToggle,
  onSearchClick,
}: {
  onMobileMenuToggle: () => void;
  onSearchClick: () => void;
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav id="main-navigation" className="bg-gray-800 text-white py-3 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 hover:bg-gray-700 rounded"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-white rounded px-3 py-1">
            <span className="text-gray-800 font-bold text-xl">
              {COMPANY_NAME}
            </span>
          </div>
        </Link>

        {/* Spacer to push right actions to the end */}
        <div className="flex-1"></div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Available Coupons */}
          <Link
            href="/coupons"
            className="hidden sm:flex items-center gap-1 text-sm hover:bg-gray-700 px-3 py-2 rounded"
          >
            <Gift className="w-5 h-5" />
            <span className="text-yellow-400 font-bold">Coupons</span>
          </Link>

          {/* Search Icon */}
          <button
            onClick={onSearchClick}
            className="hover:bg-gray-700 p-2 rounded"
            aria-label="Search"
          >
            <Search className="w-6 h-6" />
          </button>

          {/* Cart */}
          <Link href="/cart" className="relative hover:bg-gray-700 p-2 rounded">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-extrabold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded"
            >
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-900" />
              </div>
              <span className="hidden sm:inline text-sm">mohasin</span>
              <ChevronDown className="w-4 h-4 hidden sm:inline" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-lg py-2 border">
                {USER_MENU_ITEMS.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
