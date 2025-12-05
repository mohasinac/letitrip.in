/**
 * @fileoverview React Component
 * @module src/components/admin/AdminPageHeader
 * @description This file contains the AdminPageHeader component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { ReactNode } from "react";

/**
 * AdminPageHeaderProps interface
 * 
 * @interface
 * @description Defines the structure and contract for AdminPageHeaderProps
 */
interface AdminPageHeaderProps {
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** Actions */
  actions?: ReactNode;
  /** Breadcrumbs */
  breadcrumbs?: { label: string; href?: string }[];
}

/**
 * Function: Admin Page Header
 */
/**
 * Performs admin page header operation
 *
 * @returns {any} The adminpageheader result
 *
 * @example
 * AdminPageHeader();
 */

/**
 * Performs admin page header operation
 *
 * @returns {any} The adminpageheader result
 *
 * @example
 * AdminPageHeader();
 */

export function AdminPageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-3" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400 dark:text-gray-500">
                    /
                  </span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-900 dark:text-white font-medium">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>
    </div>
  );
}
