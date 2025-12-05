/**
 * @fileoverview React Component
 * @module src/components/shop/ShopAbout
 * @description This file contains the ShopAbout component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ShopFE } from "@/types/frontend/shop.types";

/**
 * ShopAboutProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopAboutProps
 */
export interface ShopAboutProps {
  /** Shop */
  shop: ShopFE;
  /** Class Name */
  className?: string;
}

/**
 * ShopAbout Component
 *
 * Displays shop description, policies, and contact information.
 * Used on shop detail pages.
 *
 * Features:
 * - Formatted description
 * - Shop establishment date
 * - Location display
 * - Contact buttons (email, call, WhatsApp)
 * - Policy tabs/accordion (return, shipping, warranty)
 *
 * @example
 * ```tsx
 * <ShopAbout shop={shop} />
 * ```
 */
/**
 * Performs shop about operation
 *
 * @param {ShopAboutProps} [{ shop, className] - Name of { shop, class
 *
 * @returns {any} The shopabout result
 *
 * @example
 * ShopAbout({ shop, className);
 */

/**
 * Performs shop about operation
 *
 * @param {ShopAboutProps} [{ shop, className] - Name of { shop, class
 *
 * @returns {any} The shopabout result
 *
 * @example
 * ShopAbout({ shop, className);
 */

export function ShopAbout({ shop, className = "" }: ShopAboutProps) {
  const [activePolicy, setActivePolicy] = useState<string | null>("return");

  const contactMethods = [
    {
      /** Icon */
      icon: Mail,
      /** Label */
      label: "Email",
      /** Value */
      value: shop.email,
      /** Href */
      href: `mailto:${shop.email}`,
      /** Show */
      show: !!shop.email,
    },
    {
      /** Icon */
      icon: Phone,
      /** Label */
      label: "Call",
      /** Value */
      value: shop.phone,
      /** Href */
      href: `tel:${shop.phone}`,
      /** Show */
      show: !!shop.phone,
    },
    {
      /** Icon */
      icon: Globe,
      /** Label */
      label: "Website",
      /** Value */
      value: shop.website,
      /** Href */
      href: shop.website,
      /** Show */
      show: !!shop.website,
    },
  ];

  const policies = [
    {
      /** Id */
      id: "return",
      /** Label */
      label: "Return Policy",
      /** Content */
      content: shop.policies?.returnPolicy || "No return policy specified.",
    },
    {
      /** Id */
      id: "shipping",
      /** Label */
      label: "Shipping Policy",
      /** Content */
      content: shop.policies?.shippingPolicy || "No shipping policy specified.",
    },
  ];

  /**
   * Performs toggle policy operation
   *
   * @param {string} policyId - policy identifier
   *
   * @returns {string} The togglepolicy result
   */

  /**
   * Performs toggle policy operation
   *
   * @param {string} policyId - policy identifier
   *
   * @returns {string} The togglepolicy result
   */

  const togglePolicy = (policyId: string) => {
    setActivePolicy(activePolicy === policyId ? null : policyId);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Description */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          About This Shop
        </h2>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {shop.description || "No description available."}
        </p>

        {/* Establishment Date */}
        {shop.createdAt && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              /** Established */
              Established:{" "}
              {new Date(shop.createdAt).toLocaleDateString("en-US", {
                /** Year */
                year: "numeric",
                /** Month */
                month: "long",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Location */}
      {(shop.city || shop.address) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Location
          </h2>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-gray-700 dark:text-gray-300">
              {shop.city && shop.state
                ? `${shop.city}, ${shop.state}`
                : shop.city || shop.state || ""}
              {shop.address && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {shop.address}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Methods */}
      {contactMethods.some((m) => m.show) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contact Shop
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {contactMethods
              .filter((method) => method.show)
              .map((method) => (
                <a
                  key={method.label}
                  href={method.href || "#"}
                  target={method.label === "Website" ? "_blank" : undefined}
                  rel={
                    method.label === "Website"
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <method.icon className="w-5 h-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {method.label}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {method.value}
                    </p>
                  </div>
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Policies Accordion */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-6 pb-4">
          Shop Policies
        </h2>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {policies.map((policy) => (
            <div key={policy.id}>
              <button
                type="button"
                onClick={() => togglePolicy(policy.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {policy.label}
                </span>
                {activePolicy === policy.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {activePolicy === policy.id && (
                <div className="px-6 pb-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {policy.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShopAbout;
