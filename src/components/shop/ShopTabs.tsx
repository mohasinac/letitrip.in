/**
 * ShopTabs Component
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Reusable tab navigation for shop pages with mobile responsive horizontal scroll.
 */

import { Gavel, MessageCircle, Package, Star, Store } from "lucide-react";
import { ReactNode } from "react";

export type ShopTabType =
  | "products"
  | "auctions"
  | "about"
  | "reviews"
  | "contact";

interface ShopTab {
  id: ShopTabType;
  label: string;
  icon?: ReactNode;
  count?: number;
  badge?: string;
}

interface ShopTabsProps {
  activeTab: ShopTabType;
  onTabChange: (tab: ShopTabType) => void;
  tabs?: ShopTab[];
  reviewCount?: number;
  productCount?: number;
  auctionCount?: number;
  className?: string;
}

const DEFAULT_TABS: ShopTab[] = [
  {
    id: "products",
    label: "Products",
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: "auctions",
    label: "Auctions",
    icon: <Gavel className="w-4 h-4" />,
  },
  {
    id: "about",
    label: "About",
    icon: <Store className="w-4 h-4" />,
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: <Star className="w-4 h-4" />,
  },
  {
    id: "contact",
    label: "Contact",
    icon: <MessageCircle className="w-4 h-4" />,
  },
];

/**
 * ShopTabs Component
 *
 * A responsive tab navigation component for shop pages with:
 * - Mobile-friendly horizontal scroll
 * - Active state highlighting
 * - Dark mode support
 * - Icon support
 * - Badge/count support
 */
export function ShopTabs({
  activeTab,
  onTabChange,
  tabs = DEFAULT_TABS,
  reviewCount,
  productCount,
  auctionCount,
  className = "",
}: ShopTabsProps) {
  const getTabColor = (tabId: ShopTabType) => {
    switch (tabId) {
      case "auctions":
        return {
          active:
            "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400",
          inactive:
            "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
        };
      case "reviews":
        return {
          active:
            "border-yellow-600 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400",
          inactive:
            "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
        };
      case "contact":
        return {
          active:
            "border-green-600 text-green-600 dark:border-green-400 dark:text-green-400",
          inactive:
            "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
        };
      default:
        return {
          active:
            "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400",
          inactive:
            "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
        };
    }
  };

  const getTabCount = (tabId: ShopTabType) => {
    switch (tabId) {
      case "reviews":
        return reviewCount;
      case "products":
        return productCount;
      case "auctions":
        return auctionCount;
      default:
        return undefined;
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 sm:gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const colors = getTabColor(tab.id);
            const count = tab.count ?? getTabCount(tab.id);
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  isActive ? colors.active : colors.inactive
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {count !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      isActive
                        ? "bg-current bg-opacity-10"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
                {tab.badge && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
