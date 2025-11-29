import { apiService } from "./api.service";
import { USER_ROUTES } from "@/constants/api-routes";
import { UserBE, UserFiltersBE } from "@/types/backend/user.types";
import {
  UserFE,
  UserProfileFormFE,
  ChangePasswordFormFE,
  OTPVerificationFormFE,
} from "@/types/frontend/user.types";
import {
  toFEUser,
  toFEUsers,
  toBEUpdateUserRequest,
  toBEBanUserRequest,
  toBEChangeRoleRequest,
} from "@/types/transforms/user.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";

class UsersService {
  // List users (admin only)
  async list(
    filters?: Partial<UserFiltersBE>,
  ): Promise<PaginatedResponseFE<UserFE>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${USER_ROUTES.LIST}?${queryString}`
      : USER_ROUTES.LIST;

    const response =
      await apiService.get<PaginatedResponseBE<UserBE>>(endpoint);

    return {
      data: toFEUsers(response.data),
      count: response.count,
      pagination: response.pagination,
    };
  }

  // Get user by ID (self/admin)
  async getById(id: string): Promise<UserFE> {
    const response: any = await apiService.get(USER_ROUTES.BY_ID(id));
    return toFEUser(response.data);
  }

  // Update user (self/admin)
  async update(id: string, formData: UserProfileFormFE): Promise<UserFE> {
    const request = toBEUpdateUserRequest(formData);
    const response: any = await apiService.patch(USER_ROUTES.BY_ID(id), {
      updates: request,
    });
    return toFEUser(response.data);
  }

  // Ban user (admin only)
  async ban(
    id: string,
    isBanned: boolean,
    banReason?: string,
  ): Promise<UserFE> {
    const request = toBEBanUserRequest(isBanned, banReason);
    const response: any = await apiService.patch(USER_ROUTES.BAN(id), request);
    return toFEUser(response.data);
  }

  // Change user role (admin only)
  async changeRole(id: string, role: string, notes?: string): Promise<UserFE> {
    const request = toBEChangeRoleRequest(role, notes);
    const response: any = await apiService.patch(USER_ROUTES.ROLE(id), request);
    return toFEUser(response.data);
  }

  // Get current user profile
  async getMe(): Promise<UserFE> {
    const response = await apiService.get<{ user: UserBE }>(
      USER_ROUTES.PROFILE,
    );
    return toFEUser(response.user);
  }

  // Update current user profile
  async updateMe(formData: UserProfileFormFE): Promise<UserFE> {
    const request = toBEUpdateUserRequest(formData);
    const response = await apiService.patch<{ user: UserBE; message: string }>(
      USER_ROUTES.UPDATE_PROFILE,
      request,
    );
    return toFEUser(response.user);
  }

  // Change password
  async changePassword(
    formData: ChangePasswordFormFE,
  ): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(USER_ROUTES.CHANGE_PASSWORD, {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  }

  // Send email verification OTP
  async sendEmailVerification(): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/user/verify-email", {});
  }

  // Verify email with OTP
  async verifyEmail(
    formData: OTPVerificationFormFE,
  ): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/user/verify-email/confirm", {
      otp: formData.otp,
    });
  }

  // Send mobile verification OTP
  async sendMobileVerification(): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/user/verify-mobile", {});
  }

  // Verify mobile with OTP
  async verifyMobile(
    formData: OTPVerificationFormFE,
  ): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/user/verify-mobile/confirm", {
      otp: formData.otp,
    });
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api${USER_ROUTES.AVATAR}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload avatar");
    }

    return response.json();
  }

  // Delete avatar
  async deleteAvatar(): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(USER_ROUTES.AVATAR);
  }

  // Delete account
  async deleteAccount(password: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/users/me/delete", {
      password,
    });
  }

  // Get user statistics (admin only)
  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    usersByRole: Record<string, number>;
  }> {
    return apiService.get<{
      totalUsers: number;
      activeUsers: number;
      newUsersThisMonth: number;
      usersByRole: Record<string, number>;
    }>(USER_ROUTES.STATS);
  }

  // Bulk operations (admin only)
  private async bulkAction(action: string, ids: string[], data?: any) {
    return apiService.post(USER_ROUTES.BULK, { action, ids, data });
  }

  async bulkMakeSeller(ids: string[]) {
    return this.bulkAction("make-seller", ids);
  }

  async bulkMakeUser(ids: string[]) {
    return this.bulkAction("make-user", ids);
  }

  async bulkBan(ids: string[], banReason?: string) {
    return this.bulkAction("ban", ids, { banReason });
  }

  async bulkUnban(ids: string[]) {
    return this.bulkAction("unban", ids);
  }

  async bulkVerifyEmail(ids: string[]) {
    return this.bulkAction("verify-email", ids);
  }

  async bulkVerifyPhone(ids: string[]) {
    return this.bulkAction("verify-phone", ids);
  }

  async bulkDelete(ids: string[]) {
    return this.bulkAction("delete", ids);
  }
}

export const usersService = new UsersService();
