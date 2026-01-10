/**
 * Auth Persistence Service
 * Handles "Remember Me" functionality by managing session persistence settings
 */

class AuthPersistenceService {
  private readonly REMEMBER_ME_KEY = "rememberMe";
  private readonly REMEMBER_ME_EXPIRY_KEY = "rememberMeExpiry";

  /**
   * Enable "Remember Me" functionality
   * @param days - Number of days to remember the user (default: 30)
   */
  enableRememberMe(days: number = 30): void {
    if (typeof window === "undefined") return;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    localStorage.setItem(this.REMEMBER_ME_KEY, "true");
    localStorage.setItem(this.REMEMBER_ME_EXPIRY_KEY, expiryDate.toISOString());
  }

  /**
   * Disable "Remember Me" functionality
   */
  disableRememberMe(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.REMEMBER_ME_KEY);
    localStorage.removeItem(this.REMEMBER_ME_EXPIRY_KEY);
  }

  /**
   * Check if "Remember Me" is currently enabled and not expired
   */
  isRememberMeEnabled(): boolean {
    if (typeof window === "undefined") return false;

    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY);
    const expiryStr = localStorage.getItem(this.REMEMBER_ME_EXPIRY_KEY);

    if (!rememberMe || !expiryStr) {
      return false;
    }

    // Check if expired
    const expiryDate = new Date(expiryStr);
    const now = new Date();

    if (now > expiryDate) {
      // Expired, clean up
      this.disableRememberMe();
      return false;
    }

    return true;
  }

  /**
   * Get remaining days for remember me
   */
  getRemainingDays(): number {
    if (typeof window === "undefined") return 0;

    const expiryStr = localStorage.getItem(this.REMEMBER_ME_EXPIRY_KEY);
    if (!expiryStr) return 0;

    const expiryDate = new Date(expiryStr);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }
}

export const authPersistenceService = new AuthPersistenceService();
