"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";
import { useCart } from "@/contexts/CartContext";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, loading, isRole, canAccess } = useEnhancedAuth();
  const { totalItems } = useCart();
  const { redirectToLogin } = useAuthRedirect();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">JustForView</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          <Link
            href="/products"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Products
          </Link>
          <Link
            href="/auctions"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Auctions
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Categories
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            About
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Search Icon */}
          <button className="hidden md:flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent relative"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-white flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* Admin/Seller Navigation Buttons */}
          {user && (user.role === "admin" || user.role === "seller") && (
            <div className="hidden md:flex items-center space-x-2">
              {/* Admin button - shows for admin users only */}
              {user.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                  title="Admin Dashboard"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Admin</span>
                </Link>
              )}
              {/* Seller button - shows for both admin and seller users (hierarchical access) */}
              {(user.role === "admin" || user.role === "seller") && (
                <Link
                  href="/seller/dashboard"
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                  title="Seller Dashboard"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-6 4h6"
                    />
                  </svg>
                  <span>Seller</span>
                </Link>
              )}
            </div>
          )}

          {/* User Menu */}
          {loading ? (
            <div className="hidden md:flex h-9 w-9 items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : user ? (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent"
              >
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email
                    ? user.email.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <span className="text-sm font-medium">
                  {user.name || user.email || "User"}
                </span>
                <svg
                  className={`h-4 w-4 transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    {user.email || "No email"}
                  </div>
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {(user.role === "admin" || user.role === "seller") && (
                    <Link
                      href={
                        user.role === "admin"
                          ? "/admin/dashboard"
                          : "/seller/dashboard"
                      }
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="btn btn-primary hidden md:inline-flex"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-3">
            <Link
              href="/products"
              className="block py-2 text-sm font-medium hover:text-primary"
            >
              Products
            </Link>
            <Link
              href="/auctions"
              className="block py-2 text-sm font-medium hover:text-primary"
            >
              Auctions
            </Link>
            <Link
              href="/categories"
              className="block py-2 text-sm font-medium hover:text-primary"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="block py-2 text-sm font-medium hover:text-primary"
            >
              About
            </Link>
            {user ? (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : user.email
                      ? user.email.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <div>
                    <div className="font-medium">
                      {user.name || user.email || "User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email || "No email"}
                    </div>
                  </div>
                </div>

                {/* Admin/Seller Quick Access in Mobile */}
                {(user.role === "admin" || user.role === "seller") && (
                  <div className="mb-3 pb-3 border-b space-y-2">
                    {/* Admin button - shows for admin users only */}
                    {user.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center space-x-2 p-2 text-sm font-medium bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    {/* Seller button - shows for both admin and seller users (hierarchical access) */}
                    {(user.role === "admin" || user.role === "seller") && (
                      <Link
                        href="/seller/dashboard"
                        className="flex items-center space-x-2 p-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-6 4h6"
                          />
                        </svg>
                        <span>Seller Dashboard</span>
                      </Link>
                    )}
                  </div>
                )}

                <Link
                  href="/account"
                  className="block py-2 text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                <Link
                  href="/orders"
                  className="block py-2 text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                {(user.role === "admin" || user.role === "seller") && (
                  <Link
                    href={
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : "/seller/dashboard"
                    }
                    className="block py-2 text-sm font-medium hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="block w-full text-left py-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block w-full btn btn-primary text-center mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
