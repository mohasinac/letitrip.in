/**
 * QuickActionsGrid Component
 * Path: src/components/admin/dashboard/QuickActionsGrid.tsx
 *
 * Grid of quick action buttons for admin dashboard.
 * Uses useTranslations (next-intl) for all labels.
 */

"use client";

import { useTranslations } from "next-intl";
import { Card, Button, Heading, TextLink } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";

const { spacing, enhancedCard } = THEME_CONSTANTS;

const ICONS = [
  <svg
    key="users"
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
  </svg>,
  <svg
    key="disabled"
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
  </svg>,
  <svg
    key="content"
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
  </svg>,
];

export function QuickActionsGrid() {
  const t = useTranslations("adminDashboard");

  const QUICK_ACTIONS = [
    {
      labelKey: "manageUsers" as const,
      href: ROUTES.ADMIN.USERS,
      icon: ICONS[0],
    },
    {
      labelKey: "reviewDisabled" as const,
      href: `${ROUTES.ADMIN.USERS}?status=disabled`,
      icon: ICONS[1],
    },
    {
      labelKey: "manageContent" as const,
      href: ROUTES.ADMIN.SECTIONS,
      icon: ICONS[2],
    },
  ];

  return (
    <Card className={enhancedCard.base}>
      <div className={spacing.cardPadding}>
        <Heading level={3} variant="primary" className="mb-4">
          {t("quickActions")}
        </Heading>
        <div className={`grid grid-cols-1 md:grid-cols-3 ${spacing.gap.md}`}>
          {QUICK_ACTIONS.map((action) => (
            <TextLink key={action.href} href={action.href} className="block">
              <Button variant="secondary" className="w-full justify-start">
                {action.icon}
                {t(action.labelKey)}
              </Button>
            </TextLink>
          ))}
        </div>
      </div>
    </Card>
  );
}
