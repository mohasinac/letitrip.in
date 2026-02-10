"use client";

import { Badge } from "@/components";
import type { UserRole } from "@/types/auth";

/**
 * RoleBadge Component
 *
 * Displays user role with color-coded badge from THEME_CONSTANTS.badge.
 * Uses role-specific variants: admin=purple, moderator=blue, seller=teal, user=gray.
 *
 * @example
 * ```tsx
 * <RoleBadge role="admin" />
 * <RoleBadge role="seller" />
 * ```
 */

interface RoleBadgeProps {
  role: UserRole;
  label?: string;
  className?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  moderator: "Moderator",
  seller: "Seller",
  user: "User",
};

const ROLE_VARIANTS: Record<UserRole, any> = {
  admin: "admin",
  moderator: "moderator",
  seller: "seller",
  user: "user",
};

export function RoleBadge({ role, label, className }: RoleBadgeProps) {
  return (
    <Badge variant={ROLE_VARIANTS[role]} className={className}>
      {label || ROLE_LABELS[role]}
    </Badge>
  );
}
