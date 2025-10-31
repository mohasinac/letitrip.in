"use client";

import { useRouter, usePathname } from "next/navigation";
import { Palette, ImageIcon, Grid3x3 } from "lucide-react";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const settingsTabs = [
  { label: "Theme", path: "/admin/settings/theme", icon: Palette },
  {
    label: "Hero Slides",
    path: "/admin/settings/hero",
    icon: ImageIcon,
  },
  {
    label: "Featured Categories",
    path: "/admin/settings/featured-categories",
    icon: Grid3x3,
  },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine current tab based on pathname
  const currentTab = settingsTabs.findIndex((tab) => pathname === tab.path);
  const tabValue = currentTab >= 0 ? currentTab : 0;

  const handleTabChange = (newValue: number) => {
    router.push(settingsTabs[newValue].path);
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h4 className="text-3xl font-bold mb-2">Admin Settings</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Configure all aspects of your application. Click on a tab to navigate
          to different settings.
        </p>

        {/* Settings Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {settingsTabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = tabValue === index;
              return (
                <button
                  key={tab.path}
                  onClick={() => handleTabChange(index)}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                  id={`settings-tab-${index}`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
