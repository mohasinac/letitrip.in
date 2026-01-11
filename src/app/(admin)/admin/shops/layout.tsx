import { TabNav } from "@/components/navigation/TabNav";
import { ADMIN_MARKETPLACE_TABS } from "@/constants/tabs";
import { ReactNode } from "react";

export default function ShopsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <TabNav tabs={ADMIN_MARKETPLACE_TABS} />
      {children}
    </div>
  );
}
