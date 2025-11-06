"use client";

import Link from "next/link";
import { ChevronUp, Facebook, Youtube, Twitter, Instagram } from "lucide-react";
import {
  ABOUT_LINKS,
  SHOPPING_NOTES,
  FEE_DESCRIPTION,
  COMPANY_INFO,
  PAYMENT_METHODS,
  LANGUAGES,
  SOCIAL_LINKS,
  COPYRIGHT_TEXT,
  SUPPORT_INFO,
} from "@/constants/footer";
import { COMPANY_NAME } from "@/constants/navigation";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-100 border-t mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
          {/* Column 1: About Links */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">About Doorzo</h3>
            <ul className="space-y-2">
              {ABOUT_LINKS.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.link}
                    className="text-gray-700 hover:text-yellow-700 text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Shopping Notes */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Shopping Notes</h3>
            <ul className="space-y-2">
              {SHOPPING_NOTES.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.link}
                    className="text-gray-700 hover:text-yellow-700 text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Fee Description */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">
              Fee Description
            </h3>
            <ul className="space-y-2">
              {FEE_DESCRIPTION.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.link}
                    className="text-gray-700 hover:text-yellow-700 text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company Information */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">
              Company Information
            </h3>
            <ul className="space-y-2">
              {COMPANY_INFO.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.link}
                    className="text-gray-700 hover:text-yellow-700 text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-800 mb-2 font-medium">{SUPPORT_INFO.title}</p>
          <Link
            href={SUPPORT_INFO.ticketLink}
            className="text-yellow-700 hover:text-yellow-800 font-bold"
          >
            Customer Ticket →
          </Link>
        </div>

        {/* Company Details & Social Media */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-bold text-xl text-gray-800">
              {COMPANY_NAME}
            </span>
            <div className="flex gap-3">
              <Link
                href="https://facebook.com"
                className="text-gray-600 hover:text-blue-600"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="https://youtube.com"
                className="text-gray-600 hover:text-red-600"
              >
                <Youtube className="w-5 h-5" />
              </Link>
              <Link
                href="https://twitter.com"
                className="text-gray-600 hover:text-blue-400"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="https://instagram.com"
                className="text-gray-600 hover:text-pink-600"
              >
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Language Selector */}
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Language: </span>
            <select className="border border-gray-300 rounded px-2 py-1 bg-white">
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-300 pt-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className="bg-white border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-600"
                title={method.name}
              >
                {method.name}
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-300 pt-4 text-center text-sm text-gray-600">
          {COPYRIGHT_TEXT}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-yellow-500 hover:bg-yellow-600 text-gray-900 p-3 rounded-full shadow-lg transition-all z-40"
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </footer>
  );
}
