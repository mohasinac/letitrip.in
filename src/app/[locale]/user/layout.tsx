"use client";

import { ReactNode } from "react";
import { UserTabs } from "@/features/user";
import { ProtectedRoute } from "@/components";

interface UserLayoutProps {
  children: ReactNode;
}

/**
 * User Layout
 *
 * Shared layout for all user section pages (Profile, Orders, Wishlist, Addresses, Settings).
 * Includes UserTabs navigation component for consistent section navigation.
 * Wrapped in ProtectedRoute so a loading spinner is shown while auth resolves
 * instead of flashing protected content to unauthenticated users.
 */
export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <ProtectedRoute requireAuth>
      <div className="w-full">
        {/* Tab Navigation - negative margins to break out of container padding */}
        <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10 mb-6">
          <UserTabs />
        </div>

        {/* Main Content */}
        <div>{children}</div>
      </div>
    </ProtectedRoute>
  );
}
