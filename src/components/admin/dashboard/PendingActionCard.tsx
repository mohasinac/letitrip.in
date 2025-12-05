/**
 * @fileoverview React Component
 * @module src/components/admin/dashboard/PendingActionCard
 * @description This file contains the PendingActionCard component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import Link from "next/link";
import { LucideIcon } from "lucide-react";

/**
 * PendingActionCardProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PendingActionCardProps
 */
interface PendingActionCardProps {
  /** Title */
  title: string;
  /** Count */
  count: number;
  /** Href */
  href: string;
  /** Icon */
  icon: LucideIcon;
  /** Color */
  color: string;
}

/**
 * Function: Pending Action Card
 */
/**
 * Performs pending action card operation
 *
 * @returns {any} The pendingactioncard result
 *
 * @example
 * PendingActionCard();
 */

/**
 * Performs pending action card operation
 *
 * @returns {any} The pendingactioncard result
 *
 * @example
 * PendingActionCard();
 */

export function PendingActionCard({
  title,
  count,
  href,
  /** Icon */
  icon: Icon,
  color,
}: PendingActionCardProps) {
  return (
    <Link
      href={href}
      className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
