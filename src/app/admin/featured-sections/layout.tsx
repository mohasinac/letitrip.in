import { TabNav } from "@/components/navigation/TabNav";
import { ADMIN_CONTENT_TABS } from "@/constants/tabs";
import { ReactNode } from "react";

export default function FeaturedSectionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <TabNav tabs={ADMIN_CONTENT_TABS} />
      {children}
    </div>
  );
}
