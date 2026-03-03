import { ReactNode } from "react";
import { SellerTabs, Main, Heading, Text, BlockHeader } from "@/components";
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
      <BlockHeader
        className={`${THEME_CONSTANTS.themed.bgSecondary} border-b ${THEME_CONSTANTS.themed.borderColor}`}
      >
        <div className="py-3 sm:py-4">
          <Heading
            level={1}
            className={`text-xl sm:text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Seller Dashboard
          </Heading>
          <Text size="xs" variant="secondary" className="sm:text-sm mt-1">
            Manage your listings, auctions, and earnings
          </Text>
        </div>
      </BlockHeader>

      {/* Tab Navigation */}
      <div
        className={`${THEME_CONSTANTS.themed.bgSecondary} border-b ${THEME_CONSTANTS.themed.borderColor} -mx-4 sm:-mx-6 lg:-mx-8`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <SellerTabs />
        </div>
      </div>

      {/* Main Content */}
      <Main className="py-4 sm:py-6">{children}</Main>
    </div>
  );
}
