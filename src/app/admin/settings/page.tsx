"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components";
import { Heading, Text } from "@/components/typography";
import { AdminTabs } from "@/components/admin";
import { FormField } from "@/components/FormField";
import { useAuth } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants/theme";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { themed } = THEME_CONSTANTS;

  const [siteName, setSiteName] = useState("LetItRip");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className={`min-h-screen ${themed.bgPrimary}`}>
        <AdminTabs />
        <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl flex items-center justify-center min-h-[400px]">
          <Heading level={3} variant="primary">
            Loading...
          </Heading>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const handleSaveSettings = () => {
    alert("Settings saved! (Demo - backend integration coming soon)");
  };

  return (
    <div className={`min-h-screen ${themed.bgPrimary}`}>
      <AdminTabs />

      <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <Heading level={2} variant="primary">
            System Settings
          </Heading>
          <Text className={`${themed.textSecondary} mt-1`}>
            Configure site settings and preferences
          </Text>
        </div>

        {/* General Settings */}
        <Card>
          <Heading level={3} variant="primary" className="mb-4">
            General Settings
          </Heading>
          <div className="space-y-4">
            <FormField
              label="Site Name"
              name="siteName"
              type="text"
              value={siteName}
              onChange={setSiteName}
              placeholder="Enter site name"
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="maintenanceMode" className={themed.textPrimary}>
                Enable Maintenance Mode
              </label>
            </div>

            {maintenanceMode && (
              <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded">
                <Text className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ Warning: Enabling maintenance mode will make the site
                  inaccessible to all users except admins
                </Text>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button variant="primary" onClick={handleSaveSettings}>
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Email Settings */}
        <Card>
          <Heading level={3} variant="primary" className="mb-4">
            Email Settings
          </Heading>
          <Text className={themed.textSecondary}>
            Configure email templates and SMTP settings
          </Text>
          <div className="mt-4">
            <Button variant="secondary">Configure Email Templates</Button>
          </div>
        </Card>

        {/* Security Settings */}
        <Card>
          <Heading level={3} variant="primary" className="mb-4">
            Security Settings
          </Heading>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div>
                <Text className="font-medium">Two-Factor Authentication</Text>
                <Text className={`${themed.textSecondary} text-sm`}>
                  Require 2FA for admin accounts
                </Text>
              </div>
              <Button variant="secondary" size="sm">
                Configure
              </Button>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div>
                <Text className="font-medium">Session Timeout</Text>
                <Text className={`${themed.textSecondary} text-sm`}>
                  Auto-logout inactive users
                </Text>
              </div>
              <Button variant="secondary" size="sm">
                Configure
              </Button>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div>
                <Text className="font-medium">Rate Limiting</Text>
                <Text className={`${themed.textSecondary} text-sm`}>
                  Protect against abuse
                </Text>
              </div>
              <Button variant="secondary" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </Card>

        {/* Coming Soon Notice */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <div className="text-center py-6">
            <span className="text-4xl mb-3 block">⚙️</span>
            <Heading level={3} variant="primary" className="mb-2">
              More Settings Coming Soon
            </Heading>
            <Text className={themed.textSecondary}>
              Additional configuration options will be added in future updates
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
