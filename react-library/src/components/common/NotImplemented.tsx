import { ArrowLeft, Clock, Construction, Github } from "lucide-react";
import { ComponentType, ReactNode } from "react";

export interface NotImplementedProps {
  title?: string;
  description?: string;
  featureName?: string;
  backHref?: string;
  backLabel?: string;
  expectedDate?: string;
  ticketUrl?: string;
  icon?: ReactNode;
  LinkComponent: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
}

/**
 * NotImplemented Component
 *
 * A placeholder component for features that are planned but not yet implemented.
 * Shows a friendly message with optional links to track progress.
 *
 * @example
 * <NotImplemented
 *   title="Advanced Analytics"
 *   description="Detailed sales and traffic analytics will be available soon."
 *   featureName="E025 - Analytics Dashboard"
 *   backHref="/admin"
 *   expectedDate="Q1 2025"
 *   LinkComponent={Link}
 * />
 */
export function NotImplemented({
  title = "Coming Soon",
  description = "This feature is currently under development and will be available soon.",
  featureName,
  backHref,
  backLabel = "Go Back",
  expectedDate,
  ticketUrl,
  icon,
  LinkComponent,
}: NotImplementedProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
          {icon || (
            <Construction className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>

        {/* Feature Name Badge */}
        {featureName && (
          <div className="inline-flex items-center gap-1 px-3 py-1 mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            <Clock className="w-3.5 h-3.5" />
            {featureName}
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>

        {/* Expected Date */}
        {expectedDate && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Expected:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {expectedDate}
            </span>
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {backHref && (
            <LinkComponent
              href={backHref}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </LinkComponent>
          )}

          {ticketUrl && (
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <Github className="w-4 h-4" />
              Track Progress
            </a>
          )}
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span>Under Development</span>
        </div>
      </div>
    </div>
  );
}

export interface NotImplementedPageProps
  extends Omit<NotImplementedProps, "LinkComponent"> {
  LinkComponent: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
}

/**
 * NotImplementedPage Component
 *
 * Full page wrapper for the NotImplemented component with consistent styling.
 */
export function NotImplementedPage({
  LinkComponent,
  ...props
}: NotImplementedPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <NotImplemented {...props} LinkComponent={LinkComponent} />
    </div>
  );
}
