import { apiService } from "./api.service";

interface User {
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

interface AuthResponse {
  message: string;
  user: User;
  sessionId: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

class AuthService {
  private readonly STORAGE_KEY = "user";
  private readonly SESSION_COOKIE_NAME = "session";

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        "/auth/register",
        data,
      );

      // Store user (session is in cookie)
      this.setUser(response.user);

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        "/auth/login",
        credentials,
      );

      // Store user (session is in cookie)
      this.setUser(response.user);

      return response;
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
      console.error("Logout error:", error);
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
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiService.get<{ user: User; session: any }>(
        "/auth/me",
      );

      // Update stored user
      this.setUser(response.user);

      return response.user;
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
  getCachedUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(this.STORAGE_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // Set user
  private setUser(user: User) {
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
      console.error("Get sessions error:", error);
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
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.patch<{ user: User }>(
      "/auth/profile",
      data,
    );

    // Update stored user
    this.setUser(response.user);
    return response.user;
  }

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return apiService.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  }
}

export const authService = new AuthService();
export type { User, AuthResponse, LoginCredentials, RegisterData };
