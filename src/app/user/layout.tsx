import { ReactNode } from "react";
import { UserTabs } from "@/components";

export const metadata = {
  title: "My Account - LetItRip",
  description: "Manage your account, orders, wishlist, and settings",
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
      {/* Tab Navigation */}
      <UserTabs />

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
