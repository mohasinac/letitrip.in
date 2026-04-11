"use client";

import { Badge } from "@mohasinac/appkit/ui";

/**
 * RoleBadge Component
 *
 * Displays a role string with a color-coded badge from THEME_CONSTANTS.badge.
 * Uses role-specific variants: admin=purple, moderator=blue, seller=teal, user=gray.
 * `role` is a plain string — no domain type import required.
 *
 * @example
 * ```tsx
 * <RoleBadge role="admin" />
 * <RoleBadge role="seller" />
 * ```
 */

interface RoleBadgeProps {
  role: string;
  label?: string;
  className?: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  moderator: "Moderator",
  seller: "Seller",
  user: "User",
};

const ROLE_VARIANTS: Record<string, string> = {
  admin: "admin",
  moderator: "moderator",
  seller: "seller",
  user: "user",
};

export function RoleBadge({ role, label, className }: RoleBadgeProps) {
  const variant = (ROLE_VARIANTS[role] ?? "default") as
    | "admin"
    | "moderator"
    | "seller"
    | "user"
    | "default";
  return (
    <Badge variant={variant} className={className}>
      {label ?? ROLE_LABELS[role] ?? role}
    </Badge>
  );
}
