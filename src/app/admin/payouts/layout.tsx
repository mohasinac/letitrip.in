import { TabNav } from "@/components/navigation/TabNav";
import { ADMIN_TRANSACTIONS_TABS } from "@/constants/tabs";
import { ReactNode } from "react";

export default function PayoutsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <TabNav tabs={ADMIN_TRANSACTIONS_TABS} />
      {children}
    </div>
  );
}
