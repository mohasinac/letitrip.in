/**
 * Admin Settings Page
 *
 * @status PLACEHOLDER - Feature pending implementation
 * @epic E021 - System Configuration
 *
 * This page will provide admin access to system settings including:
 * - General settings (site name, logo, contact info)
 * - Payment gateway configuration
 * - Shipping settings
 * - Email/SMTP configuration
 * - Feature flags
 * - Maintenance mode
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Settings | Admin Dashboard",
  description: "Manage system configuration and settings",
};

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          🚧 Coming Soon
        </h2>
        <p className="text-yellow-700">
          This feature is under development. The settings management system will
          include:
        </p>
        <ul className="list-disc list-inside mt-2 text-yellow-700">
          <li>General site settings</li>
          <li>Payment gateway configuration (Razorpay, PayU)</li>
          <li>Shipping zones and carriers</li>
          <li>Email/SMTP configuration</li>
          <li>Feature flags</li>
          <li>Maintenance mode</li>
        </ul>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SettingsCard
          title="General"
          description="Site name, logo, and contact information"
          href="/admin/settings/general"
          status="pending"
        />
        <SettingsCard
          title="Payment"
          description="Payment gateway configuration"
          href="/admin/settings/payment"
          status="pending"
        />
        <SettingsCard
          title="Shipping"
          description="Shipping zones and carrier settings"
          href="/admin/settings/shipping"
          status="pending"
        />
        <SettingsCard
          title="Email"
          description="SMTP configuration and templates"
          href="/admin/settings/email"
          status="pending"
        />
        <SettingsCard
          title="Features"
          description="Enable or disable platform features"
          href="/admin/settings/features"
          status="pending"
        />
        <SettingsCard
          title="Maintenance"
          description="Maintenance mode and access control"
          href="/admin/settings/maintenance"
          status="pending"
        />
      </div>
    </div>
  );
}

function SettingsCard({
  title,
  description,
  href,
  status,
}: {
  title: string;
  description: string;
  href: string;
  status: "pending" | "ready";
}) {
  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        {status === "pending" && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            Coming Soon
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <Link
        href={href}
        className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
      >
        Configure →
      </Link>
    </div>
  );
}
