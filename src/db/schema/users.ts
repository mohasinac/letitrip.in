/**
 * @deprecated Re-exports from @mohasinac/appkit/features/auth.
 * Import directly from "@mohasinac/appkit/features/auth" when updating import sites.
 */

export {
  type AvatarMetadata,
  type UserDocument,
  type SellerShippingMethod,
  type SellerPickupAddress,
  type SellerShippingConfig,
  type SellerPayoutMethod,
  type SellerBankAccount,
  type SellerPayoutDetails,
  USER_COLLECTION,
  DEFAULT_USER_DATA,
  USER_INDEXED_FIELDS,
  USER_PUBLIC_FIELDS,
  USER_UPDATABLE_FIELDS,
  type UserCreateInput,
  type UserUpdateInput,
  type UserAdminUpdateInput,
  type UserQueryFilter,
  userQueryHelpers,
  createUserId,
} from "@mohasinac/appkit/features/auth";

// Letitrip-specific: pii-aware query helpers (override appkit's index-based helpers)
import { piiBlindIndex } from "@mohasinac/appkit/security";
import { USER_FIELDS } from "@mohasinac/appkit/features/auth";
import type { UserRole } from "@/types/auth";

/**
 * PII-aware user query helpers for letitrip.
 * Use these instead of the appkit userQueryHelpers when you have a plaintext value.
 */
export const userPiiQueryHelpers = {
  byEmail: (email: string) =>
    [USER_FIELDS.EMAIL_INDEX, "==", piiBlindIndex(email)] as const,
  byPhone: (phone: string) =>
    [USER_FIELDS.PHONE_INDEX, "==", piiBlindIndex(phone)] as const,
  byRole: (role: UserRole) => [USER_FIELDS.ROLE, "==", role] as const,
  verified: () => [USER_FIELDS.EMAIL_VERIFIED, "==", true] as const,
  active: () => [USER_FIELDS.DISABLED, "==", false] as const,
  disabled: () => [USER_FIELDS.DISABLED, "==", true] as const,
} as const;


