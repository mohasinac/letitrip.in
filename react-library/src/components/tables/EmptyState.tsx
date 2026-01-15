import { ReactNode } from "react";

export interface EmptyStateProps {
  /**
   * Optional icon to display (ReactNode for flexibility)
   */
  icon?: ReactNode;

  /**
   * Main title text
   */
  title: string;

  /**
   * Optional description text
   */
  description?: string;

  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Custom icon container className
   */
  iconClassName?: string;

  /**
   * Custom title className
   */
  titleClassName?: string;

  /**
   * Custom description className
   */
  descriptionClassName?: string;

  /**
   * Custom action button className
   */
  actionClassName?: string;

  /**
   * Custom secondary action button className
   */
  secondaryActionClassName?: string;
}

/**
 * EmptyState - Display empty states with optional icon, description, and actions
 *
 * A flexible empty state component for showing when lists, tables, or other content areas
 * have no data to display. Supports custom icons, descriptions, and action buttons.
 *
 * Features:
 * - Optional icon display
 * - Primary and secondary action buttons
 * - Fully customizable styling
 * - Responsive layout
 * - Dark mode support
 * - Framework-agnostic (no icon dependencies)
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<SearchIcon />}
 *   title="No results found"
 *   description="Try adjusting your search terms"
 *   action={{ label: "Clear filters", onClick: () => {} }}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
  iconClassName = "",
  titleClassName = "",
  descriptionClassName = "",
  actionClassName = "",
  secondaryActionClassName = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {icon && (
        <div
          className={
            iconClassName ||
            "mb-6 p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400"
          }
        >
          {icon}
        </div>
      )}

      <h3
        className={
          titleClassName ||
          "text-xl font-semibold text-gray-900 dark:text-white mb-2"
        }
      >
        {title}
      </h3>

      {description && (
        <p
          className={
            descriptionClassName ||
            "text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md leading-relaxed"
          }
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className={
                actionClassName ||
                "px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              }
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className={
                secondaryActionClassName ||
                "px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              }
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
