/**
 * User Profile Hooks
 *
 * Custom hooks for user profile operations.
 *
 * @example
 * ```tsx
 * const { data: profile, isLoading } = useProfile();
 * const { mutate: updateProfile } = useUpdateProfile({
 *   onSuccess: () => toast.success('Profile updated!')
 * });
 * ```
 */

import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { sessionService } from "@/services";
import { updateProfileAction, type UpdateProfileInput } from "@/actions";
import type { UserDocument } from "@/db/schema";

// ============================================================================
// Types
// ============================================================================

export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Profile Hooks
// ============================================================================

/**
 * Hook to fetch user profile
 */
export function useProfile(options?: {
  enabled?: boolean;
  onSuccess?: (data: UserProfile) => void;
  onError?: (error: Error) => void;
}) {
  return useApiQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => sessionService.getProfile(),
    enabled: options?.enabled,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile(options?: {
  onSuccess?: (data: UserDocument) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useApiMutation<UserDocument, UpdateProfileInput>({
    mutationFn: (data) => updateProfileAction(data),
    onSuccess: async (data) => {
      // Invalidate profile cache so the updated data is re-fetched
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}
