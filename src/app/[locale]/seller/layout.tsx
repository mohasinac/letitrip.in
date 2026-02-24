import { ReactNode } from "react";
import { SellerTabs } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

export const metadata = {
  title: "Seller Dashboard - LetItRip",
  description: "Manage your listings, auctions, and sales on LetItRip",
  robots: { index: false, follow: false },
};

interface SellerLayoutProps {
  children: ReactNode;
}

/**
 * Seller Layout
 *
 * Shared layout for all seller section pages (Dashboard, Products, Auctions, Sales).
 * Includes SellerTabs navigation component for consistent section navigation.
 * Pattern mirrors AdminLayout for consistency.
 */
export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <div className="w-full space-y-0">
      {/* Header */}
      <header
        className={`${THEME_CONSTANTS.themed.bgSecondary} border-b ${THEME_CONSTANTS.themed.borderColor}`}
      >
        <div className="py-3 sm:py-4">
          <h1
            className={`text-xl sm:text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Seller Dashboard
          </h1>
          <p
            className={`text-xs sm:text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}
          >
            Manage your listings, auctions, and earnings
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div
        className={`${THEME_CONSTANTS.themed.bgSecondary} border-b ${THEME_CONSTANTS.themed.borderColor} -mx-4 sm:-mx-6 lg:-mx-8`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <SellerTabs />
        </div>
      </div>

      {/* Main Content */}
      <main className="py-4 sm:py-6">{children}</main>
    </div>
  );
}
