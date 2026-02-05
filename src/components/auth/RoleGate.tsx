/**
 * Role-Based Access Control Component
 *
 * Conditionally renders content based on user role.
 * Useful for showing/hiding UI elements based on permissions.
 */

"use client";

import { useAuth } from "@/hooks";
import { UserRole } from "@/types/auth";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGate({
  children,
  allowedRoles,
  fallback = null,
}: RoleGateProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const userRole = user.role as UserRole;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Admin Only Component
 */
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGate allowedRoles="admin" fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * Moderator or Admin Only Component
 */
export function ModeratorOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGate allowedRoles={["admin", "moderator"]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
