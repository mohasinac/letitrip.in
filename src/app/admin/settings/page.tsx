/**
 * Admin Settings Page
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Admin access to system settings including:
 * - General settings (site name, logo, contact info)
 * - Payment gateway configuration
 * - Shipping settings
 * - Email/Resend configuration
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SettingsCard
        title="General"
        description="Site name, logo, and contact information"
        href="/admin/settings/general"
        status="ready"
        icon="⚙️"
      />
      <SettingsCard
        title="Payment"
        description="Payment gateway configuration (Razorpay, PayU, COD)"
        href="/admin/settings/payment"
        status="ready"
        icon="💳"
      />
      <SettingsCard
        title="Shipping"
        description="Shipping zones and carrier settings"
        href="/admin/settings/shipping"
        status="ready"
        icon="📦"
      />
      <SettingsCard
        title="Email"
        description="Resend API configuration and templates"
        href="/admin/settings/email"
        status="ready"
        icon="📧"
      />
      <SettingsCard
        title="Features"
        description="Enable or disable platform features"
        href="/admin/settings/features"
        status="pending"
        icon="🎛️"
      />
      <SettingsCard
        title="Maintenance"
        description="Maintenance mode and access control"
        href="/admin/settings/maintenance"
        status="pending"
        icon="🔧"
      />
    </div>
  );
}

function SettingsCard({
  title,
  description,
  href,
  status,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  status: "pending" | "ready";
  icon: string;
}) {
  return (
    <Link
      href={href}
      className={`block border rounded-lg p-4 transition-all bg-white dark:bg-gray-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 border-gray-200 dark:border-gray-700 cursor-pointer ${
        status === "pending" ? "opacity-80" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        {status === "pending" ? (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
            Coming Soon
          </span>
        ) : (
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
            Ready
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <span className="mt-3 text-sm text-blue-600 dark:text-blue-400 inline-flex items-center">
        {status === "pending" ? "View Details →" : "Configure →"}
      </span>
    </Link>
  );
}
