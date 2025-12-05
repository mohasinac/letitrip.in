/**
 * @fileoverview React Component
 * @module src/components/admin/dashboard/QuickLink
 * @description This file contains the QuickLink component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import Link from "next/link";
import { LucideIcon } from "lucide-react";

/**
 * QuickLinkProps interface
 * 
 * @interface
 * @description Defines the structure and contract for QuickLinkProps
 */
interface QuickLinkProps {
  /** Label */
  label: string;
  /** Href */
  href: string;
  /** Icon */
  icon: LucideIcon;
}

/**
 * Function: Quick Link
 */
/**
 * Performs quick link operation
 *
 * @param {Icon }} { label, href, icon - The { label, href, icon
 *
 * @returns {any} The quicklink result
 *
 * @example
 * QuickLink({ label, href, icon);
 */

/**
 * Performs quick link operation
 *
 * @param {Icon }} { label, href, icon - The { label, href, icon
 *
 * @returns {any} The quicklink result
 *
 * @example
 * QuickLink({ label, href, icon);
 */

export function QuickLink({ label, href, icon: Icon }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-yellow-200 transition-all"
    >
      <Icon className="h-6 w-6 text-gray-600 mb-2" />
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </Link>
  );
}
