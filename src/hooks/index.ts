/**
 * Hooks Index
 *
 * Central export point for all custom hooks.
 * Import hooks from here for consistency across the application.
 *
 * @example
 * ```tsx
 * import { useSwipe, useGesture, useLongPress } from '@/hooks';
 * ```
 */

export { useSwipe } from "./useSwipe";
export type { UseSwipeOptions, SwipeDirection } from "./useSwipe";

export { useGesture } from "./useGesture";
export type { UseGestureOptions, GestureType } from "./useGesture";

export { useLongPress } from "./useLongPress";
export type { UseLongPressOptions } from "./useLongPress";

export { useApiQuery } from "./useApiQuery";
export { useApiMutation } from "./useApiMutation";
export { useProfile } from "./useProfile";
export { useForm } from "./useForm";
export { useFormState } from "./useFormState";
export { useAdminStats } from "./useAdminStats";
export { useMessage } from "./useMessage";
export {
  useAdminSessions,
  useUserSessions,
  useRevokeSession,
  useRevokeUserSessions,
  useMySessions,
  useRevokeMySession,
} from "./useSessions";

export { useClickOutside } from "./useClickOutside";
export type { UseClickOutsideOptions } from "./useClickOutside";

export { useKeyPress } from "./useKeyPress";
export type { UseKeyPressOptions, KeyModifiers } from "./useKeyPress";

export {
  useLogin,
  useRegister,
  useVerifyEmail,
  useResendVerification,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
} from "./useAuth";

// Session hooks from SessionContext
export { useSession, useAuth } from "@/contexts/SessionContext";

export {
  useAddresses,
  useAddress,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "./useAddresses";
export type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from "./useAddresses";

export { useStorageUpload } from "./useStorageUpload";
export type { UploadOptions, UploadState } from "./useStorageUpload";

export { useUnsavedChanges } from "./useUnsavedChanges";
export type {
  UseUnsavedChangesOptions,
  UseUnsavedChangesReturn,
} from "./useUnsavedChanges";
