/**
 * @fileoverview React Component
 * @module src/app/admin/featured-sections/layout
 * @description This file contains the layout component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { TabNav } from "@/components/navigation/TabNav";
import { ADMIN_CONTENT_TABS } from "@/constants/tabs";
import { ReactNode } from "react";

export default function FeaturedSectionsLayout({
  children,
}: {
  /** Children */
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <TabNav tabs={ADMIN_CONTENT_TABS} />
      {children}
    </div>
  );
}
