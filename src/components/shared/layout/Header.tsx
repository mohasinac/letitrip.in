"use client";

import { useState } from "react";
import Link from "next/link";
import { MAIN_NAVIGATION } from "@/constants/navigation";
import ThemeSelector from "@/components/shared/ThemeSelector";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300"
      style={{
        backgroundColor: "var(--theme-background)",
        borderColor: "var(--theme-primary)",
      }}
    >
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--theme-primary)" }}
          >
            <span
              className="font-bold text-sm"
              style={{ color: "var(--theme-background)" }}
            >
              JFV
            </span>
          </div>
          <span
            className="font-bold text-xl"
            style={{ color: "var(--theme-text)" }}
          >
            JustForView
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 ml-8">
          {MAIN_NAVIGATION.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-sm font-medium transition-colors hover:font-semibold"
              style={{
                color: "var(--theme-muted)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--theme-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--theme-muted)";
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Theme Selector */}
          <ThemeSelector />

          {/* Search Button */}
          <button
            className="hidden sm:flex items-center justify-center h-9 w-9 rounded-md border transition-colors"
            style={{
              borderColor: "var(--theme-primary)",
              backgroundColor: "transparent",
              color: "var(--theme-text)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--theme-primary)";
              e.currentTarget.style.color = "var(--theme-background)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--theme-text)";
            }}
            aria-label="Search"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 border shadow-sm h-9 px-4 py-2"
              style={{
                borderColor: "var(--theme-primary)",
                backgroundColor: "transparent",
                color: "var(--theme-text)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--theme-accent)";
                e.currentTarget.style.color = "var(--theme-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--theme-text)";
              }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2"
              style={{
                backgroundColor: "var(--theme-primary)",
                color: "var(--theme-background)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--theme-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--theme-primary)";
              }}
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex md:hidden items-center justify-center h-9 w-9 rounded-md border transition-colors"
            style={{
              borderColor: "var(--theme-primary)",
              backgroundColor: "transparent",
              color: "var(--theme-text)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--theme-primary)";
              e.currentTarget.style.color = "var(--theme-background)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--theme-text)";
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
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
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t transition-colors duration-300"
          style={{
            backgroundColor: "var(--theme-background)",
            borderColor: "var(--theme-primary)",
          }}
        >
          <div className="container py-4 space-y-4">
            {/* Navigation Links */}
            <nav className="space-y-2">
              {MAIN_NAVIGATION.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium transition-colors rounded-md"
                  style={{ color: "var(--theme-muted)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--theme-primary)";
                    e.currentTarget.style.color = "var(--theme-background)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--theme-muted)";
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Buttons */}
            <div
              className="flex flex-col space-y-2 pt-4 border-t"
              style={{ borderColor: "var(--theme-primary)" }}
            >
              <Link
                href="/login"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 border shadow-sm h-9 px-4 py-2"
                style={{
                  borderColor: "var(--theme-primary)",
                  backgroundColor: "transparent",
                  color: "var(--theme-text)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--theme-accent)";
                  e.currentTarget.style.color = "var(--theme-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--theme-text)";
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2"
                style={{
                  backgroundColor: "var(--theme-primary)",
                  color: "var(--theme-background)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--theme-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--theme-primary)";
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
