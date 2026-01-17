import React, { ComponentType, ReactNode } from "react";

export type ShopTabType =
  | "products"
  | "auctions"
  | "about"
  | "reviews"
  | "contact";

export interface ShopTab {
  id: ShopTabType;
  label: string;
  icon?: ReactNode;
  count?: number;
  badge?: string;
}

export interface ShopTabsProps {
  activeTab: ShopTabType;
  onTabChange: (tab: ShopTabType) => void;
  tabs: ShopTab[];
  reviewCount?: number;
  productCount?: number;
  auctionCount?: number;
  className?: string;
}

export function ShopTabs({
  activeTab,
  onTabChange,
  tabs,
  reviewCount,
  productCount,
  auctionCount,
  className = "",
}: ShopTabsProps) {
  const getTabColor = (tabId: ShopTabType) => {
    switch (tabId) {
      case "auctions":
        return {
          active: "border-purple-600 text-purple-600",
          inactive: "border-transparent text-gray-600 hover:text-gray-900",
        };
      case "reviews":
        return {
          active: "border-yellow-600 text-yellow-600",
          inactive: "border-transparent text-gray-600 hover:text-gray-900",
        };
      case "contact":
        return {
          active: "border-green-600 text-green-600",
          inactive: "border-transparent text-gray-600 hover:text-gray-900",
        };
      default:
        return {
          active: "border-blue-600 text-blue-600",
          inactive: "border-transparent text-gray-600 hover:text-gray-900",
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
      className={`bg-white border-b border-gray-200 sticky top-0 z-10 ${className}`}
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
                        : "bg-gray-200 text-gray-600"
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
