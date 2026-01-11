"use client";

/**
 * User Query Hooks
 *
 * React Query hooks for user data fetching and mutations.
 */

import { invalidateQueries, queryKeys } from "@/lib/react-query";
import { usersService } from "@/services/users.service";
import type {
  ChangePasswordFormFE,
  OTPVerificationFormFE,
  UserFE,
  UserProfileFormFE,
} from "@/types/frontend/user.types";
import type { PaginatedResponseFE } from "@/types/shared/common.types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

/**
 * Fetch current user profile
 *
 * @param options - React Query options
 * @returns Query result with user data
 *
 * @example
 * const { data: user } = useCurrentUser();
 */
export function useCurrentUser(
  options?: Omit<UseQueryOptions<UserFE>, "queryKey" | "queryFn">
) {
  return useQuery<UserFE>({
    queryKey: queryKeys.users.me(),
    queryFn: () => usersService.getMe(),
    ...options,
  });
}

/**
 * Fetch user by ID
 *
 * @param id - User ID
 * @param options - React Query options
 * @returns Query result with user data
 */
export function useUser(
  id: string | undefined,
  options?: Omit<UseQueryOptions<UserFE>, "queryKey" | "queryFn">
) {
  return useQuery<UserFE>({
    queryKey: queryKeys.users.detail(id!),
    queryFn: () => usersService.getById(id!),
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch paginated list of users (admin only)
 *
 * @param filters - Filter criteria
 * @param options - React Query options
 * @returns Query result with paginated users
 */
export function useUsers(
  filters?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<PaginatedResponseFE<UserFE>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<PaginatedResponseFE<UserFE>>({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersService.list(filters),
    ...options,
  });
}

/**
 * Update current user profile mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * const updateProfile = useUpdateProfile({
 *   onSuccess: () => toast.success('Profile updated')
 * });
 * updateProfile.mutate({ displayName: 'New Name' });
 */
export function useUpdateProfile(
  options?: UseMutationOptions<UserFE, Error, UserProfileFormFE>
) {
  const queryClient = useQueryClient();

  return useMutation<UserFE, Error, UserProfileFormFE>({
    mutationFn: (data) => usersService.updateMe(data),
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.users.me());
    },
    ...options,
  });
}

/**
 * Upload avatar mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useUploadAvatar(
  options?: UseMutationOptions<{ url: string }, Error, File>
) {
  const queryClient = useQueryClient();

  return useMutation<{ url: string }, Error, File>({
    mutationFn: (file) => usersService.uploadAvatar(file),
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.users.me());
    },
    ...options,
  });
}

/**
 * Delete avatar mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useDeleteAvatar(
  options?: UseMutationOptions<{ message: string }, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, void>({
    mutationFn: () => usersService.deleteAvatar(),
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.users.me());
    },
    ...options,
  });
}

/**
 * Change password mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useChangePassword(
  options?: UseMutationOptions<{ message: string }, Error, ChangePasswordFormFE>
) {
  return useMutation<{ message: string }, Error, ChangePasswordFormFE>({
    mutationFn: (data) => usersService.changePassword(data),
    ...options,
  });
}

/**
 * Send email verification mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useSendEmailVerification(
  options?: UseMutationOptions<{ message: string }, Error, void>
) {
  return useMutation<{ message: string }, Error, void>({
    mutationFn: () => usersService.sendEmailVerification(),
    ...options,
  });
}

/**
 * Verify email mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useVerifyEmail(
  options?: UseMutationOptions<
    { message: string },
    Error,
    OTPVerificationFormFE
  >
) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, OTPVerificationFormFE>({
    mutationFn: (data) => usersService.verifyEmail(data),
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.users.me());
    },
    ...options,
  });
}
