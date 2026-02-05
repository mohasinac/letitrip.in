/**
 * Users Collection Schema
 * 
 * Firestore schema definition for users collection
 */

import { UserRole } from '@/types/auth';

export interface UserDocument {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  passwordHash?: string; // Only for credentials auth
  emailVerified: boolean;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    lastSignInTime?: string;
    creationTime?: string;
    lastLoginAt?: Date;
    loginCount?: number;
  };
}

export const USER_COLLECTION = 'users' as const;

/**
 * Default user data for new registrations
 */
export const DEFAULT_USER_DATA: Partial<UserDocument> = {
  role: 'user',
  emailVerified: false,
  disabled: false,
  photoURL: null,
  displayName: null,
};

/**
 * Fields that should be indexed
 */
export const USER_INDEXED_FIELDS = [
  'email',
  'phoneNumber',
  'role',
  'disabled',
  'emailVerified',
] as const;

/**
 * Fields that are publicly readable (exclude sensitive data)
 */
export const USER_PUBLIC_FIELDS = [
  'uid',
  'email',
  'phoneNumber',
  'displayName',
  'photoURL',
  'role',
  'emailVerified',
  'createdAt',
] as const;

/**
 * Fields that users can update themselves
 */
export const USER_UPDATABLE_FIELDS = [
  'displayName',
  'photoURL',
] as const;

/**
 * RELATIONSHIPS:
 * 
 * users (1) ----< (N) trips
 *       (1) ----< (N) bookings
 *       (1) ----< (N) emailVerificationTokens
 *       (1) ----< (N) passwordResetTokens
 * 
 * Foreign Key Pattern (Firestore):
 * - trips/{tripId}.userId references users/{uid}
 * - bookings/{bookingId}.userId references users/{uid}
 * - emailVerificationTokens/{tokenId}.userId references users/{uid}
 * - passwordResetTokens/{tokenId}.userId references users/{uid}
 */
