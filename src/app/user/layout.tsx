import { ReactNode } from "react";
import { UserTabs } from "@/components";

export const metadata = {
  title: "My Account - LetItRip",
  description: "Manage your account, orders, wishlist, and settings",
  robots: { index: false, follow: false },
};

interface UserLayoutProps {
  children: ReactNode;
}

/**
 * User Layout
 *
 * Shared layout for all user section pages (Profile, Orders, Wishlist, Addresses, Settings).
 * Includes UserTabs navigation component for consistent section navigation.
 */
export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="w-full">
      {/* Tab Navigation - negative margins to break out of container padding */}
      <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10 mb-6">
        <UserTabs />
      </div>

      {/* Main Content */}
      <div>{children}</div>
    </div>
  );
}
