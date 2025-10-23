"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-white flex items-center justify-center">
              0
            </span>
          </Link>

          {/* User Menu */}
          <Link href="/login" className="btn btn-primary hidden md:inline-flex">
            Sign In
          </Link>

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
            <Link
              href="/login"
              className="block w-full btn btn-primary text-center mt-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
