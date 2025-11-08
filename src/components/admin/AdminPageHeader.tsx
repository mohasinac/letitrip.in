"use client";

import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

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
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400">/</span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium">
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
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>
    </div>
  );
}
