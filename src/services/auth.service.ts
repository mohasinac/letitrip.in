/**
 * @fileoverview Service Module
 * @module src/services/auth.service
 * @description This file contains service functions for auth operations
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { logServiceError } from "@/lib/error-logger";
import { UserFE } from "@/types/frontend/user.types";
import { UserRole, UserStatus } from "@/types/shared/common.types";
import { apiService } from "./api.service";

/**
 * Auth API response user (simplified, not full UserBE)
 */
interface AuthUserBE {
  /** Uid */
  uid: string;
  /** Email */
  email: string;
  /** Name */
  name: string;
  /** Role */
  role: string;
  /** Is Email Verified */
  isEmailVerified: boolean;
  /** Profile */
  profile?: {
    /** Avatar */
    avatar?: string | null;
    /** Bio */
    bio?: string | null;
    /** Address */
    address?: any;
  };
}

/**
 * Transform auth API user to UserFE
 */
/**
 * Performs to f e auth user operation
 *
 * @param {AuthUserBE} authUser - The auth user
 *
 * @returns {any} The tofeauthuser result
 */

/**
 * Performs to f e auth user operation
 *
 * @param {AuthUserBE} authUser - The auth user
 *
 * @returns {any} The tofeauthuser result
 */

function toFEAuthUser(authUser: AuthUserBE): UserFE {
  const firstName = authUser.name.split(" ")[0] || null;
  const lastName = authUser.name.split(" ").slice(1).join(" ") || null;

  return {
    /** Id */
    id: authUser.uid,
    /** Uid */
    uid: authUser.uid,
    /** Email */
    email: authUser.email,
    /** Display Name */
    displayName: authUser.name,
    /** Photo U R L */
    photoURL: authUser.profile?.avatar || null,
    /** Phone Number */
    phoneNumber: null,
    phone: null, // Alias for compatibility
    /** Role */
    role: authUser.role as UserRole,
    /** Status */
    status: UserStatus.ACTIVE,

    // Profile
    firstName,
    lastName,
    /** Full Name */
    fullName: authUser.name,
    /** Initials */
    initials: authUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    /** Bio */
    bio: authUser.profile?.bio || null,
    /** Location */
    location: null,

    // Verification
    /** Email Verified */
    emailVerified: authUser.isEmailVerified,
    /** Phone Verified */
    phoneVerified: false,
    /** Is Verified */
    isVerified: authUser.isEmailVerified,

    // Shop
    /** Shop Id */
    shopId: null,
    /** Shop Name */
    shopName: null,
    /** Shop Slug */
    shopSlug: null,
    /** Has Shop */
    hasShop: false,

    // Stats (defaults for auth user)
    /** Total Orders */
    totalOrders: 0,
    /** Total Spent */
    totalSpent: 0,
    /** Total Sales */
    totalSales: 0,
    /** Total Products */
    totalProducts: 0,
    /** Total Auctions */
    totalAuctions: 0,
    /** Rating */
    rating: 0,
    /** Review Count */
    reviewCount: 0,

    // Formatted stats
    /** Formatted Total Spent */
    formattedTotalSpent: "₹0",
    /** Formatted Total Sales */
    formattedTotalSales: "₹0",
    /** Rating Stars */
    ratingStars: 0,
    /** Rating Display */
    ratingDisplay: "No reviews yet",

    // Preferences
    /** Notifications */
    notifications: {
      /** Email */
      email: true,
      /** Push */
      push: true,
      /** Order Updates */
      orderUpdates: true,
      /** Auction Updates */
      auctionUpdates: true,
      /** Promotions */
      promotions: false,
    },

    // Timestamps
    /** Created At */
    createdAt: new Date(),
    /** Updated At */
    updatedAt: new Date(),
    /** Last Login At */
    lastLoginAt: new Date(),

    // Formatted dates
    /** Member Since */
    memberSince: "Recently joined",
    /** Last Login Display */
    lastLoginDisplay: "Just now",
    /** Account Age */
    accountAge: "New",

    // UI States
    /** Is Active */
    isActive: true,
    /** Is Blocked */
    isBlocked: false,
    /** Is Suspended */
    isSuspended: false,
    /** Is Admin */
    isAdmin: authUser.role === "admin",
    /** Is Seller */
    isSeller: authUser.role === "seller",
    /** Is User */
    isUser: authUser.role === "user",

    // Badges
    /** Badges */
    badges: authUser.isEmailVerified ? ["Verified"] : [],

    // Metadata
    /** Metadata */
    metadata: {},
  };
}

/**
 * AuthResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for AuthResponse
 */
interface AuthResponse {
  /** Message */
  message: string;
  /** User */
  user: UserFE;
  /** Session Id */
  sessionId: string;
}

/**
 * LoginCredentials interface
 * 
 * @interface
 * @description Defines the structure and contract for LoginCredentials
 */
interface LoginCredentials {
  /** Email */
  email: string;
  /** Password */
  password: string;
}

/**
 * RegisterData interface
 * 
 * @interface
 * @description Defines the structure and contract for RegisterData
 */
interface RegisterData {
  /** Email */
  email: string;
  /** Password */
  password: string;
  /** Name */
  name: string;
  /** Role */
  role?: string;
}

/**
 * GoogleAuthData interface
 * 
 * @interface
 * @description Defines the structure and contract for GoogleAuthData
 */
interface GoogleAuthData {
  /** Id Token */
  idToken: string;
  /** User Data */
  userData?: {
    /** Display Name */
    displayName?: string;
    /** Email */
    email?: string;
    /** Photo U R L */
    photoURL?: string;
  };
}

/**
 * GoogleAuthResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for GoogleAuthResponse
 */
interface GoogleAuthResponse extends AuthResponse {
  /** Is New User */
  isNewUser: boolean;
}

/**
 * AuthService class
 * 
 * @class
 * @description Description of AuthService class functionality
 */
class AuthService {
  private readonly STORAGE_KEY = "user";
  private readonly SESSION_COOKIE_NAME = "session";

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<{
        /** Message */
        message: string;
        /** User */
        user: AuthUserBE;
        /** Session Id */
        sessionId: string;
      }>("/auth/register", data);

      // Transform and store user
      const userFE = toFEAuthUser(response.user);
      this.setUser(userFE);

      return {
        /** Message */
        message: response.message,
        /** User */
        user: userFE,
        /** Session Id */
        sessionId: response.sessionId,
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<{
        /** Message */
        message: string;
        /** User */
        user: AuthUserBE;
        /** Session Id */
        sessionId: string;
      }>("/auth/login", credentials);

      // Transform and store user
      const userFE = toFEAuthUser(response.user);
      this.setUser(userFE);

      return {
        /** Message */
        message: response.message,
        /** User */
        user: userFE,
        /** Session Id */
        sessionId: response.sessionId,
      };
    } catch (error) {
      throw error;
    }
  }

  // Google Sign-In
  async loginWithGoogle(data: GoogleAuthData): Promise<GoogleAuthResponse> {
    try {
      const response = await apiService.post<{
        /** Message */
        message: string;
        /** User */
        user: AuthUserBE;
        /** Session Id */
        sessionId: string;
        /** Is New User */
        isNewUser: boolean;
      }>("/auth/google", data);

      // Transform and store user
      const userFE = toFEAuthUser(response.user);
      this.setUser(userFE);

      return {
        /** Message */
        message: response.message,
        /** User */
        user: userFE,
        /** Session Id */
        sessionId: response.sessionId,
        /** Is New User */
        isNewUser: response.isNewUser,
      };
    } catch (error) {
      throw error;
    }
  }

  // Clear session cookie on client side
  private clearSessionCookie() {
    if (typeof document !== "undefined") {
      // Clear the session cookie by setting it to expire immediately
      document.cookie = `${this.SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
      document.cookie = `${this.SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Lax`;
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint to clear server session
      await apiService.post("/auth/logout", {});
    } catch (error) {
      logServiceError("AuthService", "logout", error as Error);
    } finally {
      // Always clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem(this.STORAGE_KEY);
      }
      // Clear session cookie on client side
      this.clearSessionCookie();
    }
  }

  // Get current user from server
  async getCurrentUser(): Promise<UserFE | null> {
    try {
      const response = await apiService.get<{ user: AuthUserBE; session: any }>(
        "/auth/me",
      );

      // Transform and store user
      const userFE = toFEAuthUser(response.user);
      this.setUser(userFE);

      return userFE;
    } catch (error: any) {
      // Only clear if it's a 401 (unauthorized), not network errors
      if (error?.status === 401 || error?.response?.status === 401) {
        // Clear stored user if session is invalid
        if (typeof window !== "undefined") {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
      // Return null silently for unauthenticated users
      return null;
    }
  }

  // Get cached user from local storage
  getCachedUser(): UserFE | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(this.STORAGE_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr) as UserFE;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // Set user
  private setUser(user: UserFE) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getCachedUser();
    return user?.role || null;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  // Get all user sessions
  async getSessions(): Promise<any[]> {
    try {
      const response = await apiService.get<{ sessions: any[] }>(
        "/auth/sessions",
      );
      return response.sessions;
    } catch (error) {
      logServiceError("AuthService", "getSessions", error as Error);
      return [];
    }
  }

  // Delete a specific session
  async deleteSession(sessionId: string): Promise<void> {
    await apiService.delete("/auth/sessions", { sessionId });
  }

  // Delete all sessions (logout from all devices)
  async deleteAllSessions(): Promise<void> {
    await apiService.delete("/auth/sessions", { deleteAll: true });
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiService.post("/auth/reset-password", { email });
  }

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiService.post("/auth/verify-email", { token });
  }

  // Update user profile
  async updateProfile(data: Partial<UserFE>): Promise<UserFE> {
    const response = await apiService.patch<{ user: AuthUserBE }>(
      "/auth/profile",
      data,
    );

    // Transform and store user
    const userFE = toFEAuthUser(response.user);
    this.setUser(userFE);
    return userFE;
  }

  // Change password
  async changePassword(
    /** Current Password */
    currentPassword: string,
    /** New Password */
    newPassword: string,
  ): Promise<{ message: string }> {
    return apiService.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  }
}

export const authService = new AuthService();
export type { AuthResponse, LoginCredentials, RegisterData, UserFE as User };
