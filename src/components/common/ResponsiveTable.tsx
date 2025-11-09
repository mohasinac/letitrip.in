"use client";

import { ReactNode } from "react";

interface ResponsiveTableProps {
  children: ReactNode;
  stickyFirstColumn?: boolean;
}

/**
 * Responsive table wrapper with horizontal scroll on mobile
 * and optional sticky first column
 */
export function ResponsiveTable({
  children,
  stickyFirstColumn = true,
}: ResponsiveTableProps) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <div
          className={`min-w-full inline-block ${
            stickyFirstColumn ? "sticky-first-col" : ""
          }`}
        >
          {children}
        </div>
      </div>
      <style jsx global>{`
        .sticky-first-col table thead tr th:first-child,
        .sticky-first-col table tbody tr td:first-child {
          position: sticky;
          left: 0;
          z-index: 10;
          background-color: white;
        }

        .sticky-first-col table thead tr th:first-child {
          z-index: 11;
          background-color: rgb(249 250 251); /* bg-gray-50 */
        }

        .sticky-first-col table tbody tr:hover td:first-child {
          background-color: rgb(249 250 251); /* bg-gray-50 */
        }

        /* Add shadow to sticky column for depth */
        .sticky-first-col table thead tr th:first-child::after,
        .sticky-first-col table tbody tr td:first-child::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 1px;
          background: rgba(0, 0, 0, 0.1);
        }

        /* Ensure checkboxes are touch-friendly on mobile */
        @media (max-width: 768px) {
          .sticky-first-col table thead tr th:first-child,
          .sticky-first-col table tbody tr td:first-child {
            min-width: 48px;
          }

          /* Increase touch target size */
          input[type="checkbox"] {
            min-width: 44px;
            min-height: 44px;
            cursor: pointer;
          }
        }
      `}</style>
    </div>
  );
}
