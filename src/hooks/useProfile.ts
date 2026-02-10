/**
 * User Profile Hooks
 *
 * Custom hooks for user profile operations using the centralized API client.
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
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";

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

interface UpdateProfileData {
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
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
  onError?: (error: any) => void;
}) {
  return useApiQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => apiClient.get(API_ENDPOINTS.USER.PROFILE),
    enabled: options?.enabled,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, UpdateProfileData>({
    mutationFn: (data) => apiClient.patch(API_ENDPOINTS.PROFILE.UPDATE, data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
