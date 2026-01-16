/**
 * ResourceDetailWrapper Component
 *
 * Framework-agnostic wrapper for resource detail pages.
 * Provides consistent layout with breadcrumbs, header, tabs, and content sections.
 *
 * @example
 * ```tsx
 * <ResourceDetailWrapper
 *   context="admin"
 *   breadcrumbs={[
 *     { label: "Products", href: "/products" },
 *     { label: "Product Name" }
 *   ]}
 *   title="Product Details"
 *   subtitle="SKU: ABC123"
 *   badge={<span className="badge">Active</span>}
 *   actions={<>
 *     <button>Edit</button>
 *     <button>Delete</button>
 *   </>}
 *   onBreadcrumbClick={(href) => router.push(href)}
 * >
 *   <ProductContent />
 * </ResourceDetailWrapper>
 * ```
 */

import { ReactNode } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface StatsCard {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
}

interface ResourceDetailWrapperProps {
  /** Context for permission-based UI */
  context: "admin" | "seller" | "public";

  /** Breadcrumb navigation items */
  breadcrumbs: BreadcrumbItem[];

  /** Page title */
  title: string;

  /** Optional subtitle text */
  subtitle?: string;

  /** Badge component */
  badge?: ReactNode;

  /** Action buttons */
  actions?: ReactNode;

  /** Tab configuration */
  tabs?: Tab[];

  /** Active tab ID */
  activeTab?: string;

  /** Tab change handler */
  onTabChange?: (tabId: string) => void;

  /** Stats cards */
  stats?: StatsCard[];

  /** Main content */
  children: ReactNode;

  /** Related items section */
  relatedItems?: ReactNode;

  /** Comments/reviews section */
  commentsSection?: ReactNode;

  /** Breadcrumb click handler (injectable navigation) */
  onBreadcrumbClick?: (href: string) => void;

  /** Custom chevron icon (injectable) */
  chevronIcon?: ReactNode;
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default chevron icon
const defaultChevronIcon = (
  <svg
    className="w-4 h-4 text-gray-400 dark:text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

export function ResourceDetailWrapper({
  context,
  breadcrumbs,
  title,
  subtitle,
  badge,
  actions,
  tabs,
  activeTab,
  onTabChange,
  stats,
  children,
  relatedItems,
  commentsSection,
  onBreadcrumbClick,
  chevronIcon = defaultChevronIcon,
}: ResourceDetailWrapperProps) {
  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    if (item.href && onBreadcrumbClick) {
      onBreadcrumbClick(item.href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {item.href ? (
                  <button
                    onClick={() => handleBreadcrumbClick(item)}
                    className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-gray-900 dark:text-white font-medium">
                    {item.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && chevronIcon}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title and Badge */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                {badge && <div>{badge}</div>}
              </div>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {actions && (
              <div className="flex items-center gap-2 flex-wrap">{actions}</div>
            )}
          </div>

          {/* Stats Cards */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={cn(
                    "bg-gradient-to-br p-4 rounded-lg",
                    stat.color ||
                      "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    {stat.icon && (
                      <div className="text-gray-600 dark:text-gray-400">
                        {stat.icon}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="flex gap-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    "py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
                    activeTab === tab.id
                      ? "border-yellow-500 text-yellow-600 dark:text-yellow-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Content */}
          <div className="lg:col-span-2">
            {/* Tab Content or Children */}
            {tabs && tabs.length > 0 ? (
              <div>
                {tabs.find((tab) => tab.id === activeTab)?.content || children}
              </div>
            ) : (
              children
            )}

            {/* Comments/Reviews Section */}
            {commentsSection && <div className="mt-6">{commentsSection}</div>}
          </div>

          {/* Sidebar */}
          {relatedItems && (
            <aside className="lg:col-span-1">
              <div className="sticky top-4">{relatedItems}</div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceDetailWrapper;
