import { apiService } from "./api.service";
import type { User, UserRole, PaginatedResponse } from "@/types";

interface UserFilters {
  role?: UserRole;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface VerifyEmailData {
  otp: string;
}

interface VerifyMobileData {
  otp: string;
}

interface BanUserData {
  isBanned: boolean;
  banReason?: string;
}

interface ChangeRoleData {
  role: UserRole;
  notes?: string;
}

class UsersService {
  // List users (admin only)
  async list(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : "/users";

    return apiService.get<PaginatedResponse<User>>(endpoint);
  }

  // Get user by ID (self/admin)
  async getById(id: string): Promise<User> {
    return apiService.get<User>(`/users/${id}`);
  }

  // Update user (self/admin)
  async update(id: string, data: UpdateUserData): Promise<User> {
    return apiService.patch<User>(`/users/${id}`, data);
  }

  // Ban user (admin only)
  async ban(id: string, data: BanUserData): Promise<User> {
    return apiService.patch<User>(`/users/${id}/ban`, data);
  }

  // Change user role (admin only)
  async changeRole(id: string, data: ChangeRoleData): Promise<User> {
    return apiService.patch<User>(`/users/${id}/role`, data);
  }

  // Get current user profile
  async getMe(): Promise<User> {
    const response = await apiService.get<{ user: User }>("/user/profile");
    return response.user;
  }

  // Update current user profile
  async updateMe(data: UpdateUserData): Promise<User> {
    const response = await apiService.patch<{ user: User; message: string }>(
      "/user/profile",
      data
    );
    return response.user;
  }

  // Change password - Note: This endpoint needs to be created
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/user/password", data);
  }

  // Send email verification OTP - Note: This endpoint needs to be created
  async sendEmailVerification(): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/user/verify-email", {});
  }

  // Verify email with OTP
  async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      "/user/verify-email/confirm",
      data
    );
  }

  // Send mobile verification OTP
  async sendMobileVerification(): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/user/verify-mobile", {});
  }

  // Verify mobile with OTP
  async verifyMobile(data: VerifyMobileData): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      "/user/verify-mobile/confirm",
      data
    );
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/users/me/avatar", {
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
    return apiService.delete<{ message: string }>("/users/me/avatar");
  }

  // Delete account
  async deleteAccount(password: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/users/me/delete", {
      password,
    });
  }

  // Get user statistics (admin only)
  async getStats(): Promise<any> {
    return apiService.get<any>("/users/stats");
  }
}

export const usersService = new UsersService();
export type {
  UserFilters,
  UpdateUserData,
  ChangePasswordData,
  VerifyEmailData,
  VerifyMobileData,
  BanUserData,
  ChangeRoleData,
};
