/**
 * Authorization Utilities
 */

import { UserRole } from "@/types/auth";
import { AuthorizationError } from "@/lib/errors";

export function requireRole(user: any, roles: UserRole | UserRole[]): void {
  if (!user) {
    throw new AuthorizationError("User not authenticated");
  }

  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  const userRole = user.role || "user";

  if (!requiredRoles.includes(userRole)) {
    throw new AuthorizationError(
      "Access denied. Required role: " + requiredRoles.join(" or "),
    );
  }
}
