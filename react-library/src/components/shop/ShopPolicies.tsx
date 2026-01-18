
import {
  ChevronDown,
  ChevronUp,
  LucideIcon,
  Package,
  Truck,
} from "lucide-react";
import { useState } from "react";

export interface ShopPoliciesData {
  policies?: {
    returnPolicy?: string | null;
    shippingPolicy?: string | null;
  };
}

export interface ShopPoliciesProps {
  shop: ShopPoliciesData;
  className?: string;
}

interface PolicySection {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string | null | undefined;
}

/**
 * ShopPolicies Component
 *
 * Displays shop policies in an accordion/tabbed layout.
 * Used on shop detail pages.
 *
 * Features:
 * - Return policy
 * - Shipping policy
 * - Warranty information
 * - Accordion interaction
 * - Icons for each policy type
 * - Empty state for missing policies
 *
 * @example
 * ```tsx
 * <ShopPolicies shop={shop} />
 * ```
 */
export function ShopPolicies({ shop, className = "" }: ShopPoliciesProps) {
  const [activePolicy, setActivePolicy] = useState<string | null>("return");

  const policies: PolicySection[] = [
    {
      id: "return",
      title: "Return Policy",
      icon: Package,
      content: shop.policies?.returnPolicy,
    },
    {
      id: "shipping",
      title: "Shipping Policy",
      icon: Truck,
      content: shop.policies?.shippingPolicy,
    },
  ];

  const togglePolicy = (policyId: string) => {
    setActivePolicy(activePolicy === policyId ? null : policyId);
  };

  const hasAnyPolicy = policies.some((p) => p.content);

  if (!hasAnyPolicy) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Shop Policies
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This shop hasn't provided any policies yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-6 pb-4">
        Shop Policies
      </h2>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {policies
          .filter((policy) => policy.content)
          .map((policy) => (
            <div key={policy.id}>
              <button
                type="button"
                onClick={() => togglePolicy(policy.id)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <policy.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {policy.title}
                  </span>
                </div>
                {activePolicy === policy.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
  );
}
