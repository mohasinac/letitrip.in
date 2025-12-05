/**
 * @fileoverview React Component
 * @module src/app/admin/shops/layout
 * @description This file contains the layout component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { TabNav } from "@/components/navigation/TabNav";
import { ADMIN_MARKETPLACE_TABS } from "@/constants/tabs";
import { ReactNode } from "react";

export default /**
 * ShopsLayout component
 *
 * @param {{ children: ReactNode }} { children } - The { children }
 *
 * @returns {any} The shopslayout result
 *
 */
function ShopsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <TabNav tabs={ADMIN_MARKETPLACE_TABS} />
      {children}
    </div>
  );
}
