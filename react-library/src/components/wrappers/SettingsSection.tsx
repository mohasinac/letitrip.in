/**
 * Settings Components
 *
 * Framework-agnostic components for settings pages.
 * Provides consistent styling and layout for settings sections.
 *
 * Components:
 * - SettingsSection: Main wrapper for a settings section
 * - SettingsGroup: Groups related sections with heading
 * - SettingsRow: Single row with label and control
 *
 * @example
 * ```tsx
 * <SettingsSection
 *   title="Profile Settings"
 *   description="Manage your profile information"
 *   action={<button onClick={handleSave}>Save</button>}
 * >
 *   <form>...</form>
 * </SettingsSection>
 *
 * <SettingsGroup title="Notifications" description="Configure your notification preferences">
 *   <SettingsSection title="Email Notifications">
 *     <SettingsRow label="Marketing emails" description="Receive promotional emails">
 *       <Toggle checked={emailEnabled} onChange={setEmailEnabled} />
 *     </SettingsRow>
 *   </SettingsSection>
 * </SettingsGroup>
 * ```
 */

import { ReactNode } from "react";

interface SettingsSectionProps {
  /** Section title */
  title: string;
  /** Optional description text */
  description?: string;
  /** Section content */
  children: ReactNode;
  /** Optional action element (buttons, etc.) */
  action?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to use compact padding */
  compact?: boolean;
}

export function SettingsSection({
  title,
  description,
  children,
  action,
  className = "",
  compact = false,
}: SettingsSectionProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
        compact ? "p-4" : "p-4 sm:p-6"
      } mb-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}

/**
 * SettingsGroup Component
 *
 * Groups related settings sections together with a heading.
 */
interface SettingsGroupProps {
  /** Group title */
  title?: string;
  /** Group description */
  description?: string;
  /** Sections in this group */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function SettingsGroup({
  title,
  description,
  children,
  className = "",
}: SettingsGroupProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * SettingsRow Component
 *
 * A single row in a settings section with label, description, and control.
 */
interface SettingsRowProps {
  /** Row label */
  label: string;
  /** Optional description */
  description?: string;
  /** Control element (toggle, select, etc.) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function SettingsRow({
  label,
  description,
  children,
  className = "",
}: SettingsRowProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 ${className}`}
    >
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default {
  SettingsSection,
  SettingsGroup,
  SettingsRow,
};
