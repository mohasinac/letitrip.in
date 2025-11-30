"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronUp, Facebook, Youtube, Twitter, Instagram } from "lucide-react";
import {
  ABOUT_LINKS,
  SHOPPING_NOTES,
  FEE_DESCRIPTION,
  COMPANY_INFO,
  PAYMENT_METHODS,
  SOCIAL_LINKS,
  COPYRIGHT_TEXT,
} from "@/constants/footer";
import { COMPANY_NAME } from "@/constants/navigation";

export default function Footer() {
  const scrollToTop = () => {
    globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="main-footer"
      className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto"
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
          {/* Column 1: About Links */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              About Let It Rip
            </h3>
            <ul className="space-y-2">
              {ABOUT_LINKS.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.link}
                    className="text-gray-700 dark:text-gray-300 hover:text-yellow-700 dark:hover:text-yellow-500 text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Shopping Notes */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              Shopping Notes
            </h3>
            <ul className="space-y-2">
              {SHOPPING_NOTES.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.link}
                    className="text-gray-700 dark:text-gray-300 hover:text-yellow-700 dark:hover:text-yellow-500 text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Fee Description */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              Fee Description
            </h3>
            <ul className="space-y-2">
              {FEE_DESCRIPTION.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.link}
                    className="text-gray-700 dark:text-gray-300 hover:text-yellow-700 dark:hover:text-yellow-500 text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company Information */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              Company Information
            </h3>
            <ul className="space-y-2">
              {COMPANY_INFO.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.link}
                    className="text-gray-700 dark:text-gray-300 hover:text-yellow-700 dark:hover:text-yellow-500 text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Company Details, Social Media & Payment Methods - Merged */}
        <div className="border-t border-gray-300 dark:border-gray-600 pt-6 space-y-6">
          {/* Company Name & Social Media */}
          <div className="flex items-center justify-center gap-4">
            <span className="font-bold text-xl text-gray-800 dark:text-white">
              {COMPANY_NAME}
            </span>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => {
                const iconMap: Record<string, any> = {
                  facebook: Facebook,
                  youtube: Youtube,
                  twitter: Twitter,
                  instagram: Instagram,
                };
                const Icon = iconMap[social.icon];
                const colorMap: Record<string, string> = {
                  facebook: "hover:text-blue-600 dark:hover:text-blue-400",
                  youtube: "hover:text-red-600 dark:hover:text-red-400",
                  twitter: "hover:text-blue-400 dark:hover:text-blue-300",
                  instagram: "hover:text-pink-600 dark:hover:text-pink-400",
                };
                return (
                  <Link
                    key={social.id}
                    href={social.link}
                    className={`text-gray-600 dark:text-gray-400 ${
                      colorMap[social.icon]
                    }`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Payment Methods
          <div className="flex flex-wrap items-center justify-center gap-4">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className="bg-white border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-600 flex items-center justify-center min-w-[60px] h-8"
                title={method.name}
              >
                {method.logo ? (
                  <Image
                    src={method.logo}
                    alt={method.name}
                    width={50}
                    height={20}
                    className="object-contain"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      if (target.parentElement) {
                        target.parentElement.textContent = method.name;
                      }
                    }}
                  />
                ) : (
                  method.name
                )}
              </div>
            ))}
          </div> */}

          {/* Copyright */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-300 dark:border-gray-600">
            {COPYRIGHT_TEXT}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-36 lg:bottom-8 right-8 bg-yellow-500 hover:bg-yellow-600 text-gray-900 p-3 rounded-full shadow-lg transition-all z-40"
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </footer>
  );
}
