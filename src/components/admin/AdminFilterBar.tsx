"use client";

import { Card } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

/**
 * AdminFilterBar Component
 *
 * Card-wrapped grid of filter inputs (search, select, status tabs).
 * Uses THEME_CONSTANTS.input.base and card.base from Phase 2.
 *
 * @example
 * ```tsx
 * <AdminFilterBar>
 *   <Input placeholder="Search users..." />
 *   <Select>
 *     <option>All Roles</option>
 *     <option>Admin</option>
 *   </Select>
 * </AdminFilterBar>
 * ```
 */

interface AdminFilterBarProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  /** Wrap filter content in a Card. Defaults to true (admin pages). Set false for public/seller pages. */
  withCard?: boolean;
}

export function AdminFilterBar({
  children,
  columns = 3,
  className = "",
  withCard = true,
}: AdminFilterBarProps) {
  const { spacing } = THEME_CONSTANTS;

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const innerGrid = (
    <div className={`grid ${gridCols[columns]} ${spacing.gap.md}`}>
      {children}
    </div>
  );

  if (!withCard) return <div className={className}>{innerGrid}</div>;

  return (
    <Card className={`${spacing.cardPadding} ${className}`}>{innerGrid}</Card>
  );
}
