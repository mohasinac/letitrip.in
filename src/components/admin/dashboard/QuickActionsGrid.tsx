/**
 * QuickActionsGrid Component
 * Path: src/components/admin/dashboard/QuickActionsGrid.tsx
 *
 * Grid of quick action buttons for admin dashboard.
 * Uses UI_LABELS, ROUTES, and THEME_CONSTANTS from @/constants.
 */

"use client";

import Link from "next/link";
import { Card, Button, Heading } from "@/components";
import { UI_LABELS, ROUTES, THEME_CONSTANTS } from "@/constants";

const { spacing, enhancedCard } = THEME_CONSTANTS;

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: UI_LABELS.ADMIN.DASHBOARD.MANAGE_USERS,
    href: ROUTES.ADMIN.USERS,
    icon: (
      <svg
        className="w-5 h-5 mr-2 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    label: UI_LABELS.ADMIN.DASHBOARD.REVIEW_DISABLED,
    href: `${ROUTES.ADMIN.USERS}?status=disabled`,
    icon: (
      <svg
        className="w-5 h-5 mr-2 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
      </svg>
    ),
  },
  {
    label: UI_LABELS.ADMIN.DASHBOARD.MANAGE_CONTENT,
    href: ROUTES.ADMIN.SECTIONS,
    icon: (
      <svg
        className="w-5 h-5 mr-2 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];

export function QuickActionsGrid() {
  return (
    <Card className={enhancedCard.base}>
      <div className={spacing.cardPadding}>
        <Heading level={3} variant="primary" className="mb-4">
          {UI_LABELS.ADMIN.DASHBOARD.QUICK_ACTIONS}
        </Heading>
        <div className={`grid grid-cols-1 md:grid-cols-3 ${spacing.gap.md}`}>
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href} className="block">
              <Button variant="secondary" className="w-full justify-start">
                {action.icon}
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}
