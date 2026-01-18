import { Metadata } from "next";
import { NotImplementedPage } from "@letitrip/react-library";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Feature Flags | Admin Settings",
  description: "Enable or disable platform features",
};

export default function AdminFeatureFlagsPage() {
  return (
    <NotImplementedPage
      title="Feature Flags"
      description="Control which features are enabled or disabled across the platform. Toggle experimental features, A/B tests, and gradual rollouts."
      featureName="E021 - Feature Management"
      backHref="/admin/settings"
      backLabel="Back to Settings"
      expectedDate="Q1 2025"
      icon={
        <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
      }
    />
  );
}
