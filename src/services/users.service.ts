import { USER_ROUTES } from "@/constants/api-routes";
import { UserBE, UserFiltersBE } from "@/types/backend/user.types";
import {
  ChangePasswordFormFE,
  OTPVerificationFormFE,
  UserFE,
  UserProfileFormFE,
} from "@/types/frontend/user.types";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";
import {
  toBEBanUserRequest,
  toBEChangeRoleRequest,
  toBEUpdateUserRequest,
  toFEUser,
  toFEUsers,
} from "@/types/transforms/user.transforms";
import { apiService } from "./api.service";
import { BaseService } from "./base-service";

/**
 * Users Service - Extends BaseService
 *
 * Provides user management functionality with BaseService CRUD operations
 * plus user-specific methods for authentication, verification, and admin actions.
 */
class UsersService extends BaseService<
  UserFE,
  UserBE,
  UserProfileFormFE,
  Partial<UserProfileFormFE>
> {
  constructor() {
    super({
      resourceName: "user",
      baseRoute: USER_ROUTES.LIST,
      toFE: toFEUser,
      toBECreate: toBEUpdateUserRequest,
      toBEUpdate: toBEUpdateUserRequest,
    });
  }
  /**
   * List users (admin only)
   * Overrides getAll to use custom filter logic
   */
  async list(
    filters?: Partial<UserFiltersBE>
  ): Promise<PaginatedResponseFE<UserFE>> {
    try {
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

      const response = await apiService.get<PaginatedResponseBE<UserBE>>(
        endpoint
      );

      return {
        data: toFEUsers(response.data),
        count: response.count,
        pagination: response.pagination,
      };
    } catch (error) {
      throw this.handleError(error as Error, "list");
    }
  }

  /**
   * Update user (self/admin)
   * Overrides base update to use custom endpoint structure
   */
  async update(id: string, formData: UserProfileFormFE): Promise<UserFE> {
    try {
      const request = toBEUpdateUserRequest(formData);
      const response: any = await apiService.patch(USER_ROUTES.BY_ID(id), {
        updates: request,
      });
      return toFEUser(response.data);
    } catch (error) {
      throw this.handleError(error as Error, `update(${id})`);
    }
  }

  /**
   * Ban user (admin only)
   */
  async ban(
    id: string,
    isBanned: boolean,
    banReason?: string
  ): Promise<UserFE> {
    try {
      const request = toBEBanUserRequest(isBanned, banReason);
      const response: any = await apiService.patch(
        USER_ROUTES.BAN(id),
        request
      );
      return toFEUser(response.data);
    } catch (error) {
      throw this.handleError(error as Error, `ban(${id})`);
    }
  }

  /**
   * Change user role (admin only)
   */
  async changeRole(id: string, role: string, notes?: string): Promise<UserFE> {
    try {
      const request = toBEChangeRoleRequest(role, notes);
      const response: any = await apiService.patch(
        USER_ROUTES.ROLE(id),
        request
      );
      return toFEUser(response.data);
    } catch (error) {
      throw this.handleError(error as Error, `changeRole(${id})`);
    }
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<UserFE> {
    try {
      const response = await apiService.get<{ user: UserBE }>(
        USER_ROUTES.PROFILE
      );
      return toFEUser(response.user);
    } catch (error) {
      throw this.handleError(error as Error, "getMe");
    }
  }

  /**
   * Update current user profile
   */
  async updateMe(formData: UserProfileFormFE): Promise<UserFE> {
    try {
      const request = toBEUpdateUserRequest(formData);
      const response = await apiService.patch<{
        user: UserBE;
        message: string;
      }>(USER_ROUTES.UPDATE_PROFILE, request);
      return toFEUser(response.user);
    } catch (error) {
      throw this.handleError(error as Error, "updateMe");
    }
  }

  /**
   * Change password
   */
  async changePassword(
    formData: ChangePasswordFormFE
  ): Promise<{ message: string }> {
    try {
      return apiService.post<{ message: string }>(USER_ROUTES.CHANGE_PASSWORD, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
    } catch (error) {
      throw this.handleError(error as Error, "changePassword");
    }
  }

  /**
   * Send email verification OTP
   */
  async sendEmailVerification(): Promise<{ message: string }> {
    try {
      return apiService.post<{ message: string }>("/user/verify-email", {});
    } catch (error) {
      throw this.handleError(error as Error, "sendEmailVerification");
    }
  }

  /**
   * Verify email with OTP
   */
  async verifyEmail(
    formData: OTPVerificationFormFE
  ): Promise<{ message: string }> {
    try {
      return apiService.post<{ message: string }>(
        "/user/verify-email/confirm",
        {
          otp: formData.otp,
        }
      );
    } catch (error) {
      throw this.handleError(error as Error, "verifyEmail");
    }
  }

  /**
   * Send mobile verification OTP
   */
  async sendMobileVerification(): Promise<{ message: string }> {
    try {
      return apiService.post<{ message: string }>("/user/verify-mobile", {});
    } catch (error) {
      throw this.handleError(error as Error, "sendMobileVerification");
    }
  }

  /**
   * Verify mobile with OTP
   */
  async verifyMobile(
    formData: OTPVerificationFormFE
  ): Promise<{ message: string }> {
    try {
      return apiService.post<{ message: string }>(
        "/user/verify-mobile/confirm",
        {
          otp: formData.otp,
        }
      );
    } catch (error) {
      throw this.handleError(error as Error, "verifyMobile");
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      return apiService.postFormData<{ url: string }>(
        USER_ROUTES.AVATAR,
        formData
      );
    } catch (error) {
      throw this.handleError(error as Error, "uploadAvatar");
    }
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<{ message: string }> {
    try {
      return apiService.delete<{ message: string }>(USER_ROUTES.AVATAR);
    } catch (error) {
      throw this.handleError(error as Error, "deleteAvatar");
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<{ message: string }> {
    try {
      return apiService.post<{ message: string }>("/users/me/delete", {
        password,
      });
    } catch (error) {
      throw this.handleError(error as Error, "deleteAccount");
    }
  }

  /**
   * Get user statistics (admin only)
   */
  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    usersByRole: Record<string, number>;
  }> {
    try {
      return apiService.get<{
        totalUsers: number;
        activeUsers: number;
        newUsersThisMonth: number;
        usersByRole: Record<string, number>;
      }>(USER_ROUTES.STATS);
    } catch (error) {
      throw this.handleError(error as Error, "getStats");
    }
  }

  /**
   * Bulk operations (admin only)
   */
  private async bulkAction(action: string, ids: string[], data?: any) {
    try {
      return apiService.post(USER_ROUTES.BULK, { action, ids, data });
    } catch (error) {
      throw this.handleError(error as Error, `bulkAction(${action})`);
    }
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
