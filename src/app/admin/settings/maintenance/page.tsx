import { Metadata } from "next";
import { NotImplementedPage } from "@/components/common/NotImplemented";
import { Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Maintenance Mode | Admin Settings",
  description: "Configure maintenance mode and access control",
};

export default function AdminMaintenancePage() {
  return (
    <NotImplementedPage
      title="Maintenance Mode"
      description="Put the platform in maintenance mode for updates or scheduled downtime. Configure access controls and display custom maintenance messages."
      featureName="E021 - System Maintenance"
      backHref="/admin/settings"
      backLabel="Back to Settings"
      expectedDate="Q1 2025"
      icon={<Wrench className="w-10 h-10 text-orange-600 dark:text-orange-400" />}
    />
  );
}
