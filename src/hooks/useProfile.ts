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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfileAction, type UpdateProfileInput } from "@/actions";
import { apiClient } from "@mohasinac/appkit/http";

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
  return useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => apiClient.get<UserProfile>("/api/user/profile"),
    enabled: options?.enabled,
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile(options?: {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfileAction(data),
    onSuccess: async (data) => {
      // Invalidate profile cache so the updated data is re-fetched
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

