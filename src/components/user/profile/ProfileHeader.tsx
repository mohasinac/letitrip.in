"use client";

import { AvatarDisplay, RoleBadge, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import type { UserRole } from "@/types/auth";

/**
 * ProfileHeader Component
 *
 * Hero section for user profile with avatar, name, role, and email.
 * Uses RoleBadge and gradient banner from Phase 2.
 *
 * @example
 * ```tsx
 * <ProfileHeader
 *   photoURL="https://..."
 *   displayName="John Doe"
 *   email="john@example.com"
 *   role="user"
 * />
 * ```
 */

interface ProfileHeaderProps {
  photoURL?: string;
  displayName: string;
  email: string;
  role: UserRole;
  className?: string;
}

export function ProfileHeader({
  photoURL,
  displayName,
  email,
  role,
  className = "",
}: ProfileHeaderProps) {
  const { spacing, typography, pageHeader, themed } = THEME_CONSTANTS;

  return (
    <div className={`${pageHeader.withGradient} ${className}`}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <AvatarDisplay
          cropData={
            photoURL
              ? { url: photoURL, position: { x: 50, y: 50 }, zoom: 1 }
              : null
          }
          displayName={displayName}
          email={email}
          size="xl"
          className="flex-shrink-0"
        />

        {/* User Info */}
        <div
          className={`flex-1 text-center sm:text-left ${spacing.stackSmall}`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3">
            <h1 className={typography.pageTitle}>{displayName}</h1>
            <RoleBadge role={role} />
          </div>

          <Text
            className={`${typography.pageSubtitle} ${themed.textSecondary}`}
          >
            {email}
          </Text>
        </div>
      </div>
    </div>
  );
}
