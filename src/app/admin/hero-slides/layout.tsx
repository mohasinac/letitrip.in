/**
 * @fileoverview React Component
 * @module src/app/admin/hero-slides/layout
 * @description This file contains the layout component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { TabNav } from "@/components/navigation/TabNav";
import { ADMIN_CONTENT_TABS } from "@/constants/tabs";
import { ReactNode } from "react";

export default /**
 * HeroSlidesLayout component
 *
 * @param {{
  
  children: ReactNode;
}} {
  children,
} - The {
  children,
}
 *
 * @returns {any} The heroslideslayout result
 *
 */
function HeroSlidesLayout({
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
