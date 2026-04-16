"use client";

import { useAuth } from "@/contexts/SessionContext";
import {
  RoleGate as AppkitRoleGate,
  type RoleGateProps as AppkitRoleGateProps,
} from "@mohasinac/appkit/features/auth";

/**
 * RoleGate — Thin letitrip adapter
 *
 * Wraps appkit RoleGate and injects user from session context.
 */

export type RoleGateProps = Omit<AppkitRoleGateProps, "user">;

export function RoleGate({
  children,
  allowedRoles,
  fallback,
}: RoleGateProps) {
  const { user } = useAuth();

  return (
    <AppkitRoleGate
      user={user}
      allowedRoles={allowedRoles}
      fallback={fallback}
    >
      {children}
    </AppkitRoleGate>
  );
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

