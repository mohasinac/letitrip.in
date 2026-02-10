"use client";

import { THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import Link from "next/link";

export function ContactCTA() {
  return (
    <div
      className={`${THEME_CONSTANTS.spacing.padding.xl} p-8 ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl} text-center`}
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div
          className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.borderRadius.full} bg-blue-100 dark:bg-blue-900/20`}
        >
          <svg
            className="w-12 h-12 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <h2
        className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
      >
        Still Need Help?
      </h2>

      {/* Description */}
      <p
        className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} mb-6 ${THEME_CONSTANTS.container["2xl"]} mx-auto`}
      >
        Can't find the answer you're looking for? Our support team is here to
        help you. Get in touch and we'll get back to you as soon as possible.
      </p>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Email */}
        <a
          href={`mailto:${SITE_CONFIG.contact.email}`}
          className={`${THEME_CONSTANTS.spacing.padding.lg} ${THEME_CONSTANTS.themed.bgTertiary} ${THEME_CONSTANTS.borderRadius.xl} hover:${THEME_CONSTANTS.themed.bgPrimary} transition-colors group`}
        >
          <svg
            className={`w-8 h-8 ${THEME_CONSTANTS.themed.textSecondary} group-hover:text-blue-600 dark:group-hover:text-blue-400 mx-auto mb-3 transition-colors`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p
            className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textPrimary} font-medium mb-1`}
          >
            Email Us
          </p>
          <p
            className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {SITE_CONFIG.contact.email}
          </p>
        </a>

        {/* Phone */}
        <a
          href={`tel:${SITE_CONFIG.contact.phone}`}
          className={`${THEME_CONSTANTS.spacing.padding.lg} ${THEME_CONSTANTS.themed.bgTertiary} ${THEME_CONSTANTS.borderRadius.xl} hover:${THEME_CONSTANTS.themed.bgPrimary} transition-colors group`}
        >
          <svg
            className={`w-8 h-8 ${THEME_CONSTANTS.themed.textSecondary} group-hover:text-blue-600 dark:group-hover:text-blue-400 mx-auto mb-3 transition-colors`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <p
            className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textPrimary} font-medium mb-1`}
          >
            Call Us
          </p>
          <p
            className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {SITE_CONFIG.contact.phone}
          </p>
        </a>

        {/* Contact Form */}
        <Link
          href="/contact"
          className={`${THEME_CONSTANTS.spacing.padding.lg} ${THEME_CONSTANTS.themed.bgTertiary} ${THEME_CONSTANTS.borderRadius.xl} hover:${THEME_CONSTANTS.themed.bgPrimary} transition-colors group`}
        >
          <svg
            className={`w-8 h-8 ${THEME_CONSTANTS.themed.textSecondary} group-hover:text-blue-600 dark:group-hover:text-blue-400 mx-auto mb-3 transition-colors`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p
            className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textPrimary} font-medium mb-1`}
          >
            Contact Form
          </p>
          <p
            className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            Submit a request
          </p>
        </Link>
      </div>

      {/* Primary CTA Button */}
      <Link
        href="/contact"
        className={`inline-flex items-center gap-2 ${THEME_CONSTANTS.spacing.padding.lg} ${THEME_CONSTANTS.borderRadius.xl} bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}
      >
        <span>Contact Support Team</span>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
}
