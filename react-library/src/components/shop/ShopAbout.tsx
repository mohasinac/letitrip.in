
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useState } from "react";

export interface ShopAboutData {
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  createdAt?: Date | string | null;
  policies?: {
    returnPolicy?: string | null;
    shippingPolicy?: string | null;
  };
}

export interface ShopAboutProps {
  shop: ShopAboutData;
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
 * - Contact buttons (email, call, website)
 * - Policy accordion (return, shipping)
 *
 * @example
 * ```tsx
 * <ShopAbout shop={shop} />
 * ```
 */
export function ShopAbout({ shop, className = "" }: ShopAboutProps) {
  const [activePolicy, setActivePolicy] = useState<string | null>("return");

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: shop.email,
      href: shop.email ? `mailto:${shop.email}` : undefined,
      show: !!shop.email,
    },
    {
      icon: Phone,
      label: "Call",
      value: shop.phone,
      href: shop.phone ? `tel:${shop.phone}` : undefined,
      show: !!shop.phone,
    },
    {
      icon: Globe,
      label: "Website",
      value: shop.website,
      href: shop.website || undefined,
      show: !!shop.website,
    },
  ];

  const policies = [
    {
      id: "return",
      label: "Return Policy",
      content: shop.policies?.returnPolicy || "No return policy specified.",
    },
    {
      id: "shipping",
      label: "Shipping Policy",
      content: shop.policies?.shippingPolicy || "No shipping policy specified.",
    },
  ];

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
              Established:{" "}
              {new Date(shop.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
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

