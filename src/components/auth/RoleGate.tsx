/**
 * Role-Based Access Control Component
 * 
 * Conditionally renders content based on user role.
 * Useful for showing/hiding UI elements based on permissions.
 */

'use client';

import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { data: session } = useSession();

  if (!session) {
    return <>{fallback}</>;
  }

  const userRole = (session.user as any).role as UserRole;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Admin Only Component
 */
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGate allowedRoles="admin" fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * Moderator or Admin Only Component
 */
export function ModeratorOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGate allowedRoles={['admin', 'moderator']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
