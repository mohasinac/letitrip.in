"use client";

import React from "react";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import Breadcrumb from "@/components/shared/Breadcrumb";

/**
 * Global Breadcrumb Display Component
 * Should be placed in the main layout to show breadcrumbs site-wide
 */
export const GlobalBreadcrumb: React.FC = () => {
  const { items } = useBreadcrumb();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-3">
        <Breadcrumb
          items={items}
          showHome={false}
          divider="chevron"
          className="text-sm"
        />
      </div>
    </div>
  );
};

export default GlobalBreadcrumb;
