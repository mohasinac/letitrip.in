/**
 * @fileoverview React Component
 * @module src/app/admin/orders/layout
 * @description This file contains the layout component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { TabNav } from "@/components/navigation/TabNav";
import { ADMIN_TRANSACTIONS_TABS } from "@/constants/tabs";
import { ReactNode } from "react";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <TabNav tabs={ADMIN_TRANSACTIONS_TABS} />
      {children}
    </div>
  );
}
