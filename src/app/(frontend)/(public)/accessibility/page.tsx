"use client";

import React from "react";
import {
  Eye,
  Keyboard,
  MousePointer,
  Volume2,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Accessibility Statement
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            HobbiesSpot is committed to ensuring digital accessibility for
            people with disabilities
          </p>
        </div>

        {/* Commitment */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Our Commitment
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We are continually improving the user experience for everyone and
            applying the relevant accessibility standards to ensure we provide
            equal access to all of our users.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            We aim to conform to the Web Content Accessibility Guidelines (WCAG)
            2.1 Level AA standards.
          </p>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Accessibility Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Keyboard Navigation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Full keyboard support for navigating our website without a
                  mouse
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Screen Reader Support
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Semantic HTML and ARIA labels for screen reader compatibility
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <MousePointer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Clear Focus Indicators
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visible focus states for all interactive elements
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Text Alternatives
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Alternative text for images and multimedia content
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Responsive Design
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mobile-friendly and works across all devices and screen sizes
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Color Contrast
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  High contrast ratios for better readability
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Keyboard Shortcuts
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-gray-700 dark:text-gray-300">
                Navigate forward
              </span>
              <code className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-mono">
                Tab
              </code>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-gray-700 dark:text-gray-300">
                Navigate backward
              </span>
              <code className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-mono">
                Shift + Tab
              </code>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-gray-700 dark:text-gray-300">
                Activate link/button
              </span>
              <code className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-mono">
                Enter
              </code>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-gray-700 dark:text-gray-300">
                Close dialog/modal
              </span>
              <code className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-mono">
                Esc
              </code>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Feedback and Contact
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We welcome your feedback on the accessibility of HobbiesSpot. Please
            let us know if you encounter accessibility barriers:
          </p>

          <div className="space-y-3 mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:accessibility@hobbiesspot.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                accessibility@hobbiesspot.com
              </a>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Contact Form:</strong>{" "}
              <Link
                href="/contact"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Visit our contact page
              </Link>
            </p>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            We try to respond to feedback within 5 business days.
          </p>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Last updated: January 2025
        </div>
      </div>
    </div>
  );
}
