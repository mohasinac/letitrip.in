/**
 * @fileoverview React Component
 * @module src/app/user/UserLayoutClient
 * @description This file contains the UserLayoutClient component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React from "react";
import {
  MobileNavRow,
  userMobileNavItems,
} from "@/components/layout/MobileNavRow";

/**
 * UserLayoutClientProps interface
 * 
 * @interface
 * @description Defines the structure and contract for UserLayoutClientProps
 */
interface UserLayoutClientProps {
  /** Children */
  children: React.ReactNode;
}

/**
 * Function: User Layout Client
 */
/**
 * Performs user layout client operation
 *
 * @param {UserLayoutClientProps} { children } - The { children }
 *
 * @returns {any} The userlayoutclient result
 *
 * @example
 * UserLayoutClient({ children });
 */

/**
 * Performs user layout client operation
 *
 * @param {UserLayoutClientProps} { children } - The { children }
 *
 * @returns {any} The userlayoutclient result
 *
 * @example
 * UserLayoutClient({ children });
 */

export function UserLayoutClient({ children }: UserLayoutClientProps) {
  return (
    <>
      {children}
      {/* Mobile Navigation Row - above bottom nav, hidden on desktop */}
      <MobileNavRow items={userMobileNavItems} variant="user" />
    </>
  );
}
