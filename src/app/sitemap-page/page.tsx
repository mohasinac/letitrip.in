"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
  ShoppingBag,
  Package,
  Heart,
  User,
  Shield,
  Store,
  HelpCircle,
  Mail,
  FileText,
} from "lucide-react";

export default function SitemapPage() {
  const siteLinks = {
    Main: [
      { name: "Home", href: "/", icon: Home },
      { name: "Products", href: "/products", icon: ShoppingBag },
      { name: "Categories", href: "/categories", icon: Package },
      { name: "Contact", href: "/contact", icon: Mail },
    ],
    Account: [
      { name: "My Profile", href: "/profile", icon: User },
      { name: "My Orders", href: "/profile/orders", icon: Package },
      { name: "Wishlist", href: "/wishlist", icon: Heart },
      { name: "Addresses", href: "/profile/addresses", icon: Package },
      { name: "Track Order", href: "/profile/track-order", icon: Package },
      { name: "Settings", href: "/profile/settings", icon: Shield },
    ],
    Help: [
      { name: "FAQ", href: "/faq", icon: HelpCircle },
      { name: "Shipping Information", href: "/help/shipping", icon: Package },
      { name: "Contact Support", href: "/contact", icon: Mail },
    ],
    Legal: [
      { name: "About Us", href: "/about", icon: FileText },
      { name: "Terms of Service", href: "/terms", icon: FileText },
      { name: "Privacy Policy", href: "/privacy", icon: FileText },
      { name: "Cookie Policy", href: "/cookies", icon: FileText },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sitemap
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Navigate through our website easily
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(siteLinks).map(([category, links]) => (
            <div
              key={category}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                {category}
              </h2>
              <ul className="space-y-3">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors no-underline group"
                      >
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Can't find what you're looking for?{" "}
            <Link
              href="/contact"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Contact us
            </Link>{" "}
            for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
