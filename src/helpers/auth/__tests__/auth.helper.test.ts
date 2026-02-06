/**
 * @jest-environment jsdom
 */

import {
  hasRole,
  hasAnyRole,
  getDefaultRole,
  canChangeRole,
  formatAuthProvider,
  isSessionExpired,
  getSessionTimeRemaining,
  generateInitials,
  calculatePasswordScore,
} from "../auth.helper";

describe("Auth Helper", () => {
  describe("hasRole", () => {
    it("should allow user with exact role", () => {
      expect(hasRole("admin", "admin")).toBe(true);
      expect(hasRole("moderator", "moderator")).toBe(true);
      expect(hasRole("seller", "seller")).toBe(true);
      expect(hasRole("user", "user")).toBe(true);
    });

    it("should allow higher roles to access lower role features", () => {
      expect(hasRole("admin", "moderator")).toBe(true);
      expect(hasRole("admin", "seller")).toBe(true);
      expect(hasRole("admin", "user")).toBe(true);
      expect(hasRole("moderator", "seller")).toBe(true);
      expect(hasRole("moderator", "user")).toBe(true);
      expect(hasRole("seller", "user")).toBe(true);
    });

    it("should deny lower roles from accessing higher role features", () => {
      expect(hasRole("user", "seller")).toBe(false);
      expect(hasRole("user", "moderator")).toBe(false);
      expect(hasRole("user", "admin")).toBe(false);
      expect(hasRole("seller", "moderator")).toBe(false);
      expect(hasRole("seller", "admin")).toBe(false);
      expect(hasRole("moderator", "admin")).toBe(false);
    });
  });

  describe("hasAnyRole", () => {
    it("should return true if user has any of the required roles", () => {
      expect(hasAnyRole("admin", ["admin", "moderator"])).toBe(true);
      expect(hasAnyRole("moderator", ["admin", "moderator"])).toBe(true);
      expect(hasAnyRole("seller", ["seller", "admin"])).toBe(true);
    });

    it("should return true if user has higher role", () => {
      expect(hasAnyRole("admin", ["moderator", "seller"])).toBe(true);
      expect(hasAnyRole("moderator", ["seller", "user"])).toBe(true);
    });

    it("should return false if user has none of the required roles", () => {
      expect(hasAnyRole("user", ["admin", "moderator"])).toBe(false);
      expect(hasAnyRole("seller", ["admin", "moderator"])).toBe(false);
    });

    it("should handle empty role array", () => {
      expect(hasAnyRole("admin", [])).toBe(false);
    });
  });

  describe("getDefaultRole", () => {
    it("should return admin for admin email", () => {
      expect(getDefaultRole("admin@letitrip.in")).toBe("admin");
    });

    it("should return user for other emails", () => {
      expect(getDefaultRole("user@example.com")).toBe("user");
      expect(getDefaultRole("seller@example.com")).toBe("user");
      expect(getDefaultRole("test@letitrip.in")).toBe("user");
    });

    it("should be case-sensitive", () => {
      expect(getDefaultRole("Admin@letitrip.in")).toBe("user");
      expect(getDefaultRole("ADMIN@LETITRIP.IN")).toBe("user");
    });
  });

  describe("canChangeRole", () => {
    it("should allow admin to change any role", () => {
      expect(canChangeRole("admin", "user", "seller")).toBe(true);
      expect(canChangeRole("admin", "seller", "moderator")).toBe(true);
      expect(canChangeRole("admin", "moderator", "admin")).toBe(true);
      expect(canChangeRole("admin", "admin", "user")).toBe(true);
    });

    it("should allow moderator to promote user to seller only", () => {
      expect(canChangeRole("moderator", "user", "seller")).toBe(true);
    });

    it("should deny moderator from other role changes", () => {
      expect(canChangeRole("moderator", "user", "moderator")).toBe(false);
      expect(canChangeRole("moderator", "user", "admin")).toBe(false);
      expect(canChangeRole("moderator", "seller", "moderator")).toBe(false);
      expect(canChangeRole("moderator", "moderator", "admin")).toBe(false);
    });

    it("should deny seller from changing any roles", () => {
      expect(canChangeRole("seller", "user", "seller")).toBe(false);
      expect(canChangeRole("seller", "seller", "moderator")).toBe(false);
    });

    it("should deny user from changing any roles", () => {
      expect(canChangeRole("user", "user", "seller")).toBe(false);
      expect(canChangeRole("user", "user", "admin")).toBe(false);
    });
  });

  describe("formatAuthProvider", () => {
    it("should format known providers", () => {
      expect(formatAuthProvider("password")).toBe("Email/Password");
      expect(formatAuthProvider("google.com")).toBe("Google");
      expect(formatAuthProvider("apple.com")).toBe("Apple");
      expect(formatAuthProvider("phone")).toBe("Phone");
    });

    it("should return original string for unknown providers", () => {
      expect(formatAuthProvider("github.com")).toBe("github.com");
      expect(formatAuthProvider("custom")).toBe("custom");
    });
  });

  describe("isSessionExpired", () => {
    it("should detect expired sessions", () => {
      const past = new Date(Date.now() - 1000);
      expect(isSessionExpired(past)).toBe(true);
    });

    it("should detect active sessions", () => {
      const future = new Date(Date.now() + 1000000);
      expect(isSessionExpired(future)).toBe(false);
    });

    it("should handle string dates", () => {
      const past = new Date(Date.now() - 1000).toISOString();
      const future = new Date(Date.now() + 1000000).toISOString();
      expect(isSessionExpired(past)).toBe(true);
      expect(isSessionExpired(future)).toBe(false);
    });

    it("should handle edge case at exact expiry", () => {
      // Due to timing, this might be slightly off, but should be expired or very close
      const now = new Date();
      expect(isSessionExpired(now)).toBe(true);
    });
  });

  describe("getSessionTimeRemaining", () => {
    it("should calculate time remaining in minutes", () => {
      const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
      expect(getSessionTimeRemaining(oneHourLater)).toBe(60);
    });

    it("should return 0 for expired sessions", () => {
      const past = new Date(Date.now() - 1000);
      expect(getSessionTimeRemaining(past)).toBe(0);
    });

    it("should handle string dates", () => {
      const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      expect(getSessionTimeRemaining(oneHourLater)).toBe(60);
    });

    it("should round down to nearest minute", () => {
      const futureTime = new Date(Date.now() + 90 * 1000); // 1.5 minutes
      expect(getSessionTimeRemaining(futureTime)).toBe(1);
    });
  });

  describe("generateInitials", () => {
    it("should generate initials from full name", () => {
      expect(generateInitials("John Doe")).toBe("JD");
      expect(generateInitials("Alice Smith")).toBe("AS");
      expect(generateInitials("Bob Johnson")).toBe("BJ");
    });

    it("should handle three or more names", () => {
      expect(generateInitials("John Michael Doe")).toBe("JD"); // First and last
      expect(generateInitials("Mary Jane Watson Parker")).toBe("MP");
    });

    it("should handle single name", () => {
      expect(generateInitials("John")).toBe("JO");
      expect(generateInitials("Alice")).toBe("AL");
    });

    it("should fallback to email if no display name", () => {
      expect(generateInitials(null, "user@example.com")).toBe("US");
      expect(generateInitials(undefined, "test@test.com")).toBe("TE");
    });

    it("should prefer display name over email", () => {
      expect(generateInitials("John Doe", "user@example.com")).toBe("JD");
    });

    it("should return default for no inputs", () => {
      expect(generateInitials()).toBe("U");
      expect(generateInitials(null, null)).toBe("U");
    });

    it("should handle extra whitespace", () => {
      expect(generateInitials("  John   Doe  ")).toBe("JD");
    });

    it("should uppercase initials", () => {
      expect(generateInitials("john doe")).toBe("JD");
      expect(generateInitials(null, "user@example.com")).toBe("US");
    });
  });

  describe("calculatePasswordScore", () => {
    it("should give low score for weak passwords", () => {
      expect(calculatePasswordScore("pass")).toBe(0);
      expect(calculatePasswordScore("abc123")).toBe(0);
      expect(calculatePasswordScore("password")).toBe(0); // Common password
      expect(calculatePasswordScore("123456")).toBe(0); // Common password
    });

    it("should give medium score for moderate passwords", () => {
      expect(calculatePasswordScore("Password1")).toBe(2); // 8 chars + mixed case + digit
      expect(calculatePasswordScore("MyPass123")).toBe(2);
    });

    it("should give high score for strong passwords", () => {
      expect(calculatePasswordScore("Password123!")).toBe(4); // All criteria met
      expect(calculatePasswordScore("MyP@ssw0rd!")).toBe(4);
      expect(calculatePasswordScore("Str0ng!Pass#")).toBe(4); // 12+ chars + all criteria
    });

    it("should penalize repeated characters", () => {
      const withRepeats = calculatePasswordScore("Passsssword1!");
      const withoutRepeats = calculatePasswordScore("Password1!");
      expect(withRepeats).toBeLessThan(withoutRepeats);
    });

    it("should detect common passwords", () => {
      expect(calculatePasswordScore("password123")).toBe(0);
      expect(calculatePasswordScore("qwerty123")).toBe(0);
      expect(calculatePasswordScore("PASSWORD")).toBe(0);
    });

    it("should not exceed max score of 4", () => {
      expect(calculatePasswordScore("VeryStr0ng!P@ssw0rd#2024")).toBe(4);
      expect(calculatePasswordScore("SuperSecure123!@#$%")).toBe(4);
    });

    it("should give 0 for empty password", () => {
      expect(calculatePasswordScore("")).toBe(0);
    });
  });
});
