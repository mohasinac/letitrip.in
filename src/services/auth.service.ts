import { logServiceError } from "@/lib/error-logger";
import { UserFE } from "@/types/frontend/user.types";
import { UserRole, UserStatus } from "@/types/shared/common.types";
import { z } from "zod";
import { apiService } from "./api.service";

/**
 * Zod validation schemas for authentication
 */

// Login credentials schema
export const LoginCredentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

// Register data schema
export const RegisterDataSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  role: z.enum(["user", "seller"]).optional().default("user"),
});

// Google auth data schema
export const GoogleAuthDataSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
  userData: z
    .object({
      displayName: z.string().optional(),
      email: z.string().email().optional(),
      photoURL: z.string().url().optional(),
    })
    .optional(),
});

// Password reset request schema
export const PasswordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Change password schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Email verification schema
export const EmailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

/**
 * Auth API response user (simplified, not full UserBE)
 */
interface AuthUserBE {
  uid: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  profile?: {
    avatar?: string | null;
    bio?: string | null;
    address?: any;
  };
}

/**
 * Transform auth API user to UserFE
 */
function toFEAuthUser(authUser: AuthUserBE): UserFE {
  const firstName = authUser.name.split(" ")[0] || null;
  const lastName = authUser.name.split(" ").slice(1).join(" ") || null;

  return {
    id: authUser.uid,
    uid: authUser.uid,
    email: authUser.email,
    displayName: authUser.name,
    photoURL: authUser.profile?.avatar || null,
    phoneNumber: null,
    phone: null, // Alias for compatibility
    role: authUser.role as UserRole,
    status: UserStatus.ACTIVE,

    // Profile
    firstName,
    lastName,
    fullName: authUser.name,
    initials: authUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    bio: authUser.profile?.bio || null,
    location: null,

    // Verification
    emailVerified: authUser.isEmailVerified,
    phoneVerified: false,
    isVerified: authUser.isEmailVerified,

    // Shop
    shopId: null,
    shopName: null,
    shopSlug: null,
    hasShop: false,

    // Stats (defaults for auth user)
    totalOrders: 0,
    totalSpent: 0,
    totalSales: 0,
    totalProducts: 0,
    totalAuctions: 0,
    rating: 0,
    reviewCount: 0,

    // Formatted stats
    formattedTotalSpent: "₹0",
    formattedTotalSales: "₹0",
    ratingStars: 0,
    ratingDisplay: "No reviews yet",

    // Preferences
    notifications: {
      email: true,
      push: true,
      orderUpdates: true,
      auctionUpdates: true,
      promotions: false,
    },

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),

    // Formatted dates
    memberSince: "Recently joined",
    lastLoginDisplay: "Just now",
    accountAge: "New",

    // UI States
    isActive: true,
    isBlocked: false,
    isSuspended: false,
    isAdmin: authUser.role === "admin",
    isSeller: authUser.role === "seller",
    isUser: authUser.role === "user",

    // Badges
    badges: authUser.isEmailVerified ? ["Verified"] : [],

    // Metadata
    metadata: {},
  };
}

interface AuthResponse {
  message: string;
  user: UserFE;
  sessionId: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

interface GoogleAuthData {
  idToken: string;
  userData?: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
}

interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

class AuthService {
  private readonly STORAGE_KEY = "user";
  private readonly SESSION_COOKIE_NAME = "session";

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate input with Zod
      const validatedData = RegisterDataSchema.parse(data);

      const response = await apiService.post<{
        message: string;
        user: AuthUserBE;
        sessionId: string;
      }>("/auth/register", validatedData);

      // Transform and store user
      const userFE = toFEAuthUser(response.user);
      this.setUser(userFE);

      return {
        message: response.message,
        user: userFE,
        sessionId: response.sessionId,
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validate input with Zod
      const validatedCredentials = LoginCredentialsSchema.parse(credentials);

      const response = await apiService.post<{
        message: string;
        user: AuthUserBE;
        sessionId: string;
      }>("/auth/login", validatedCredentials);

      // Transform and store user
      const userFE = toFEAuthUser(response.user);
      this.setUser(userFE);

      return {
        message: response.message,
        user: userFE,
        sessionId: response.sessionId,
      };
    } catch (error) {
      throw error;
    }
  }

  // Google Sign-In
  async loginWithGoogle(data: GoogleAuthData): Promise<GoogleAuthResponse> {
    try {
      // Validate input with Zod
      const validatedData = GoogleAuthDataSchema.parse(data);

      const response = await apiService.post<{
        message: string;
        user: AuthUserBE;
        sessionId: string;
        isNewUser: boolean;
      }>("/auth/google", validatedData);

      // Transform and store user
      const userFE = toFEAuthUser(response.user);
      this.setUser(userFE);

      return {
        message: response.message,
        user: userFE,
        sessionId: response.sessionId,
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
        "/auth/me"
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
        "/auth/sessions"
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
    // Validate email with Zod
    const validatedData = PasswordResetRequestSchema.parse({ email });
    return apiService.post("/auth/reset-password", validatedData);
  }

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    // Validate token with Zod
    const validatedData = EmailVerificationSchema.parse({ token });
    return apiService.post("/auth/verify-email", validatedData);
  }

  // Update user profile
  async updateProfile(data: Partial<UserFE>): Promise<UserFE> {
    const response = await apiService.patch<{ user: AuthUserBE }>(
      "/auth/profile",
      data
    );

    // Transform and store user
    const userFE = toFEAuthUser(response.user);
    this.setUser(userFE);
    return userFE;
  }

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // Validate passwords with Zod
    const validatedData = ChangePasswordSchema.parse({
      currentPassword,
      newPassword,
    });
    return apiService.post("/auth/change-password", validatedData);
  }
}

export const authService = new AuthService();
export type { AuthResponse, LoginCredentials, RegisterData, UserFE as User };
