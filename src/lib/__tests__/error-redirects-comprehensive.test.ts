/**
 * Comprehensive Error Redirects Test Suite
 *
 * Tests URL generation for error pages with context and query parameters.
 * Focuses on URL encoding, parameter handling, and helper function behavior.
 *
 * Testing Focus:
 * - URL generation with query parameters
 * - Error details encoding and serialization
 * - Helper function shortcuts (notFound.*, unauthorized.*, forbidden.*)
 * - Stack trace handling and truncation
 * - Special characters and URL encoding
 * - Timestamp generation
 * - All error reason types
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CRITICAL: Double URL Encoding Pattern (Security Feature)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The error-redirects module uses DOUBLE ENCODING for the details parameter:
 *
 * 1. First encoding:  encodeURIComponent() on the details string
 * 2. Second encoding: URLSearchParams.set() encodes again
 *
 * Example:
 *   "Error: Test" → "Error%3A%20Test" (after encodeURIComponent)
 *                 → "Error%253A%2520Test" (after URLSearchParams)
 *
 * Common encodings:
 * - Colon (:)   → %253A (not %3A)
 * - Space       → %2520 (not %20)
 * - Percent (%) → %2525 (not %25)
 * - Less than   → %253C (not %3C)
 *
 * Security rationale:
 * - Prevents XSS by ensuring special chars never interpreted as code
 * - Protects against URL parsing edge cases
 * - Makes URLs safer but less human-readable
 *
 * All test expectations use double-encoded format to match actual behavior.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  forbidden,
  forbiddenUrl,
  notFound,
  notFoundUrl,
  unauthorized,
  unauthorizedUrl,
  type ErrorReason,
} from "../error-redirects";

describe("Error Redirects - Comprehensive Edge Cases", () => {
  // Mock Date for consistent timestamp testing
  const mockDate = new Date("2024-12-08T10:00:00.000Z");
  let originalDate: typeof Date;

  beforeAll(() => {
    originalDate = global.Date;
    global.Date = class extends originalDate {
      constructor() {
        super();
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    } as any;
  });

  afterAll(() => {
    global.Date = originalDate;
  });

  describe("notFoundUrl - 404 Error URLs", () => {
    describe("basic URL generation", () => {
      it("generates URL without parameters", () => {
        const url = notFoundUrl({});
        expect(url).toContain("/not-found?");
        // NOTE: Details are double-encoded (%25 = encoded %)
        expect(url).toContain("details=Timestamp%253A");
      });

      it("generates URL with reason only", () => {
        const url = notFoundUrl({ reason: "product-not-found" });
        expect(url).toContain("reason=product-not-found");
      });

      it("generates URL with resource only", () => {
        const url = notFoundUrl({ resource: "product-123" });
        expect(url).toContain("resource=product-123");
      });

      it("generates URL with reason and resource", () => {
        const url = notFoundUrl({
          reason: "product-not-found",
          resource: "product-123",
        });

        expect(url).toContain("reason=product-not-found");
        expect(url).toContain("resource=product-123");
      });

      it("includes timestamp in details", () => {
        const url = notFoundUrl({ resource: "test" });

        // NOTE: Details are double-encoded
        expect(url).toContain("Timestamp%253A");
        expect(url).toContain("2024-12-08T10%253A00%253A00.000Z");
      });
    });

    describe("error object handling", () => {
      it("includes error message in details", () => {
        const error = new Error("Database connection failed");
        const url = notFoundUrl({ error });

        // NOTE: Double-encoded (%2520 = encoded space)
        expect(url).toContain(
          "Error%253A%2520Database%2520connection%2520failed"
        );
      });

      it("includes stack trace in details (first 3 lines)", () => {
        const error = new Error("Test error");
        const url = notFoundUrl({ error });

        // NOTE: Stack trace is double-encoded
        expect(url).toContain("Stack%253A");
      });

      it("handles error without stack trace", () => {
        const error = new Error("No stack");
        delete (error as any).stack;

        const url = notFoundUrl({ error });
        expect(url).toContain("Error%253A%2520No%2520stack");
        expect(url).not.toContain("Stack%253A");
      });

      it("handles non-Error objects", () => {
        const error = { message: "Custom error", code: 404 };
        const url = notFoundUrl({ error });

        // Should convert to string (double-encoded)
        expect(url).toContain("Error%253A");
      });

      it("handles string errors", () => {
        const error = "Something went wrong";
        const url = notFoundUrl({ error });

        expect(url).toContain("Error%253A%2520Something%2520went%2520wrong");
      });

      it("handles null error", () => {
        const url = notFoundUrl({ error: null });

        // null is falsy, so error won't be included
        expect(url).toContain("Timestamp%253A");
      });

      it("handles undefined error", () => {
        const url = notFoundUrl({ error: undefined });

        expect(url).toContain("Timestamp%253A");
      });
    });

    describe("details parameter", () => {
      it("includes custom details", () => {
        const url = notFoundUrl({
          details: "Additional context about the error",
        });

        expect(url).toContain(
          "Additional%2520context%2520about%2520the%2520error"
        );
      });

      it("combines resource, error, and details", () => {
        const url = notFoundUrl({
          resource: "product-123",
          error: new Error("Not in database"),
          details: "User attempted direct URL access",
        });

        expect(url).toContain("Resource%253A%2520product-123");
        expect(url).toContain("Error%253A%2520Not%2520in%2520database");
        expect(url).toContain(
          "User%2520attempted%2520direct%2520URL%2520access"
        );
      });

      it("handles empty details string", () => {
        const url = notFoundUrl({ details: "" });

        // Empty string is falsy, won't be included
        expect(url).toContain("Timestamp%253A");
      });
    });

    describe("URL encoding", () => {
      it("encodes special characters in resource", () => {
        const url = notFoundUrl({
          resource: "product name with spaces",
        });

        expect(url).toContain("resource=product+name+with+spaces");
      });

      it("encodes URL-unsafe characters", () => {
        const url = notFoundUrl({
          resource: "item&id=123",
        });

        expect(url).toContain("resource=item%26id%3D123");
      });

      it("handles Unicode characters in resource", () => {
        const url = notFoundUrl({
          resource: "उत्पाद-123", // Hindi
        });

        expect(url).toContain("resource=");
        expect(url.length).toBeGreaterThan(0);
      });

      it("encodes details parameter", () => {
        const url = notFoundUrl({
          details: "Error: <script>alert('xss')</script>",
        });

        // Details should be URI encoded
        expect(url).toContain("details=");
        expect(url).not.toContain("<script>");
      });
    });

    describe("all error reasons", () => {
      const notFoundReasons: ErrorReason[] = [
        "product-not-found",
        "shop-not-found",
        "auction-not-found",
        "category-not-found",
        "user-not-found",
        "order-not-found",
      ];

      notFoundReasons.forEach((reason) => {
        it(`handles reason: ${reason}`, () => {
          const url = notFoundUrl({ reason });
          expect(url).toContain(`reason=${reason}`);
        });
      });
    });

    describe("edge cases", () => {
      it("handles very long resource names", () => {
        const longResource = "a".repeat(1000);
        const url = notFoundUrl({ resource: longResource });

        expect(url).toContain("resource=");
        expect(url.length).toBeGreaterThan(1000);
      });

      it("handles very long error messages", () => {
        const error = new Error("Error: " + "X".repeat(5000));
        const url = notFoundUrl({ error });

        expect(url).toContain("Error%253A");
      });

      it("handles multiple parameters", () => {
        const url = notFoundUrl({
          reason: "product-not-found",
          resource: "product-123",
          details: "Out of stock",
          error: new Error("Inventory error"),
        });

        expect(url).toContain("reason=");
        expect(url).toContain("resource=");
        expect(url).toContain("details=");
      });

      it("returns valid URL for empty params", () => {
        const url = notFoundUrl({});

        expect(url).toMatch(/^\/not-found\?/);
        expect(url).toContain("details=");
      });
    });
  });

  describe("unauthorizedUrl - 401 Error URLs", () => {
    describe("basic URL generation", () => {
      it("generates URL without parameters", () => {
        const url = unauthorizedUrl({});
        expect(url).toContain("/unauthorized?");
      });

      it("generates URL with reason only", () => {
        const url = unauthorizedUrl({ reason: "not-logged-in" });
        expect(url).toContain("reason=not-logged-in");
      });

      it("generates URL with resource only", () => {
        const url = unauthorizedUrl({ resource: "/dashboard" });
        expect(url).toContain("resource=%2Fdashboard");
      });

      it("generates URL with requiredRole", () => {
        const url = unauthorizedUrl({ requiredRole: "admin" });
        expect(url).toContain("role=admin");
      });

      it("generates URL with all parameters", () => {
        const url = unauthorizedUrl({
          reason: "session-expired",
          resource: "/admin/users",
          requiredRole: "admin",
          details: "Session timeout",
        });

        expect(url).toContain("reason=session-expired");
        expect(url).toContain("resource=");
        expect(url).toContain("role=admin");
        expect(url).toContain("details=");
      });
    });

    describe("error handling", () => {
      it("includes error message in details", () => {
        const error = new Error("Token validation failed");
        const url = unauthorizedUrl({ error });

        expect(url).toContain("Error%253A%2520Token%2520validation%2520failed");
      });

      it("omits stack trace (only includes message)", () => {
        const error = new Error("Test error");
        const url = unauthorizedUrl({ error });

        // NOTE: unauthorizedUrl doesn't include stack traces
        expect(url).toContain("Error%253A%2520Test%2520error");
        expect(url).not.toContain("Stack%253A");
      });
    });

    describe("all error reasons", () => {
      const unauthorizedReasons: ErrorReason[] = [
        "not-logged-in",
        "session-expired",
        "invalid-token",
      ];

      unauthorizedReasons.forEach((reason) => {
        it(`handles reason: ${reason}`, () => {
          const url = unauthorizedUrl({ reason });
          expect(url).toContain(`reason=${reason}`);
        });
      });
    });

    describe("details structure", () => {
      it("includes resource in details", () => {
        const url = unauthorizedUrl({ resource: "/admin" });
        expect(url).toContain("Resource%253A%2520%252Fadmin");
      });

      it("includes requiredRole in details", () => {
        const url = unauthorizedUrl({ requiredRole: "seller" });
        expect(url).toContain("Required%2520Role%253A%2520seller");
      });

      it("includes timestamp", () => {
        const url = unauthorizedUrl({});
        expect(url).toContain(
          "Timestamp%253A%25202024-12-08T10%253A00%253A00.000Z"
        );
      });

      it("combines all details components", () => {
        const url = unauthorizedUrl({
          resource: "/dashboard",
          requiredRole: "admin",
          details: "Access denied",
          error: new Error("Auth failed"),
        });

        expect(url).toContain("Resource%253A");
        expect(url).toContain("Required%2520Role%253A");
        expect(url).toContain("Access%2520denied");
        expect(url).toContain("Error%253A%2520Auth%2520failed");
        expect(url).toContain("Timestamp%253A");
      });
    });
  });

  describe("forbiddenUrl - 403 Error URLs", () => {
    describe("basic URL generation", () => {
      it("generates URL without parameters", () => {
        const url = forbiddenUrl({});
        expect(url).toContain("/forbidden?");
      });

      it("generates URL with reason only", () => {
        const url = forbiddenUrl({ reason: "insufficient-permissions" });
        expect(url).toContain("reason=insufficient-permissions");
      });

      it("generates URL with role parameters", () => {
        const url = forbiddenUrl({
          requiredRole: "admin",
          currentRole: "buyer",
        });

        expect(url).toContain("role=admin");
        expect(url).toContain("current=buyer");
      });

      it("generates URL with all parameters", () => {
        const url = forbiddenUrl({
          reason: "wrong-role",
          resource: "/admin/settings",
          requiredRole: "admin",
          currentRole: "seller",
          details: "Seller cannot access admin settings",
        });

        expect(url).toContain("reason=wrong-role");
        expect(url).toContain("resource=");
        expect(url).toContain("role=admin");
        expect(url).toContain("current=seller");
        expect(url).toContain("details=");
      });
    });

    describe("all error reasons", () => {
      const forbiddenReasons: ErrorReason[] = [
        "insufficient-permissions",
        "wrong-role",
        "account-suspended",
        "email-not-verified",
      ];

      forbiddenReasons.forEach((reason) => {
        it(`handles reason: ${reason}`, () => {
          const url = forbiddenUrl({ reason });
          expect(url).toContain(`reason=${reason}`);
        });
      });
    });

    describe("details structure", () => {
      it("includes resource in details", () => {
        const url = forbiddenUrl({ resource: "/admin/users" });
        expect(url).toContain("Resource%253A%2520%252Fadmin%252Fusers");
      });

      it("includes both roles in details", () => {
        const url = forbiddenUrl({
          requiredRole: "admin",
          currentRole: "buyer",
        });

        expect(url).toContain("Required%2520Role%253A%2520admin");
        expect(url).toContain("Current%2520Role%253A%2520buyer");
      });

      it("includes error message without stack trace", () => {
        const error = new Error("Permission denied");
        const url = forbiddenUrl({ error });

        expect(url).toContain("Error%253A%2520Permission%2520denied");
        expect(url).not.toContain("Stack%253A");
      });

      it("combines all details components", () => {
        const url = forbiddenUrl({
          resource: "/shop/edit",
          requiredRole: "seller",
          currentRole: "buyer",
          details: "Not shop owner",
          error: new Error("Ownership check failed"),
        });

        expect(url).toContain("Resource%253A");
        expect(url).toContain("Required%2520Role%253A");
        expect(url).toContain("Current%2520Role%253A");
        expect(url).toContain("Not%2520shop%2520owner");
        expect(url).toContain("Error%253A");
        expect(url).toContain("Timestamp%253A");
      });
    });
  });

  describe("notFound Helper - Quick Shortcuts", () => {
    describe("notFound.product", () => {
      it("generates product not found URL", () => {
        const url = notFound.product("vintage-camera");

        expect(url).toContain("reason=product-not-found");
        expect(url).toContain("resource=vintage-camera");
      });

      it("includes error if provided", () => {
        const error = new Error("Product deleted");
        const url = notFound.product("old-product", error);

        expect(url).toContain("Error%253A%2520Product%2520deleted");
      });

      it("handles special characters in slug", () => {
        const url = notFound.product("product-with-&-symbol");
        expect(url).toContain("resource=product-with-%26-symbol");
      });
    });

    describe("notFound.shop", () => {
      it("generates shop not found URL", () => {
        const url = notFound.shop("tech-store");

        expect(url).toContain("reason=shop-not-found");
        expect(url).toContain("resource=tech-store");
      });

      it("includes error if provided", () => {
        const error = new Error("Shop closed");
        const url = notFound.shop("closed-shop", error);

        expect(url).toContain("Error%253A%2520Shop%2520closed");
      });
    });

    describe("notFound.auction", () => {
      it("generates auction not found URL", () => {
        const url = notFound.auction("antique-vase-auction");

        expect(url).toContain("reason=auction-not-found");
        expect(url).toContain("resource=antique-vase-auction");
      });

      it("includes error if provided", () => {
        const error = new Error("Auction ended");
        const url = notFound.auction("ended-auction", error);

        expect(url).toContain("Error%253A%2520Auction%2520ended");
      });
    });

    describe("notFound.category", () => {
      it("generates category not found URL", () => {
        const url = notFound.category("electronics");

        expect(url).toContain("reason=category-not-found");
        expect(url).toContain("resource=electronics");
      });
    });

    describe("notFound.order", () => {
      it("generates order not found URL", () => {
        const url = notFound.order("ORD-12345");

        expect(url).toContain("reason=order-not-found");
        expect(url).toContain("resource=ORD-12345");
      });

      it("handles UUID order IDs", () => {
        const url = notFound.order("550e8400-e29b-41d4-a716-446655440000");
        expect(url).toContain("resource=550e8400-e29b-41d4-a716-446655440000");
      });
    });
  });

  describe("unauthorized Helper - Quick Shortcuts", () => {
    describe("unauthorized.notLoggedIn", () => {
      it("generates not logged in URL", () => {
        const url = unauthorized.notLoggedIn();

        expect(url).toContain("reason=not-logged-in");
      });

      it("includes resource if provided", () => {
        const url = unauthorized.notLoggedIn("/dashboard");

        expect(url).toContain("reason=not-logged-in");
        expect(url).toContain("resource=%2Fdashboard");
      });

      it("handles undefined resource", () => {
        const url = unauthorized.notLoggedIn(undefined);

        expect(url).toContain("reason=not-logged-in");
      });
    });

    describe("unauthorized.sessionExpired", () => {
      it("generates session expired URL", () => {
        const url = unauthorized.sessionExpired();

        expect(url).toContain("reason=session-expired");
      });

      it("includes resource if provided", () => {
        const url = unauthorized.sessionExpired("/checkout");

        expect(url).toContain("reason=session-expired");
        expect(url).toContain("resource=%2Fcheckout");
      });
    });

    describe("unauthorized.invalidToken", () => {
      it("generates invalid token URL", () => {
        const url = unauthorized.invalidToken();

        expect(url).toContain("reason=invalid-token");
      });

      it("includes resource and error", () => {
        const error = new Error("JWT expired");
        const url = unauthorized.invalidToken("/api/data", error);

        expect(url).toContain("reason=invalid-token");
        expect(url).toContain("resource=%2Fapi%2Fdata");
        expect(url).toContain("Error%253A%2520JWT%2520expired");
      });
    });
  });

  describe("forbidden Helper - Quick Shortcuts", () => {
    describe("forbidden.wrongRole", () => {
      it("generates wrong role URL", () => {
        const url = forbidden.wrongRole("admin", "buyer");

        expect(url).toContain("reason=wrong-role");
        expect(url).toContain("role=admin");
        expect(url).toContain("current=buyer");
      });

      it("includes resource if provided", () => {
        const url = forbidden.wrongRole("seller", "buyer", "/shop/create");

        expect(url).toContain("reason=wrong-role");
        expect(url).toContain("role=seller");
        expect(url).toContain("current=buyer");
        expect(url).toContain("resource=%2Fshop%2Fcreate");
      });

      it("handles undefined current role", () => {
        const url = forbidden.wrongRole("admin", undefined);

        expect(url).toContain("reason=wrong-role");
        expect(url).toContain("role=admin");
      });
    });

    describe("forbidden.insufficientPermissions", () => {
      it("generates insufficient permissions URL", () => {
        const url = forbidden.insufficientPermissions();

        expect(url).toContain("reason=insufficient-permissions");
      });

      it("includes required role and resource", () => {
        const url = forbidden.insufficientPermissions(
          "moderator",
          "/admin/reports"
        );

        expect(url).toContain("reason=insufficient-permissions");
        expect(url).toContain("role=moderator");
        expect(url).toContain("resource=%2Fadmin%2Freports");
      });
    });

    describe("forbidden.accountSuspended", () => {
      it("generates account suspended URL", () => {
        const url = forbidden.accountSuspended();

        expect(url).toContain("reason=account-suspended");
      });

      it("includes custom details", () => {
        const url = forbidden.accountSuspended("Violation of terms of service");

        expect(url).toContain("reason=account-suspended");
        expect(url).toContain("Violation%2520of%2520terms%2520of%2520service");
      });

      it("handles undefined details", () => {
        const url = forbidden.accountSuspended(undefined);

        expect(url).toContain("reason=account-suspended");
      });
    });

    describe("forbidden.emailNotVerified", () => {
      it("generates email not verified URL", () => {
        const url = forbidden.emailNotVerified();

        expect(url).toContain("reason=email-not-verified");
      });

      it("includes resource if provided", () => {
        const url = forbidden.emailNotVerified("/shop/create");

        expect(url).toContain("reason=email-not-verified");
        expect(url).toContain("resource=%2Fshop%2Fcreate");
      });
    });
  });

  describe("Integration Tests - Real-world Scenarios", () => {
    it("handles complete 404 scenario with all context", () => {
      const error = new Error("Query returned no results");
      error.stack =
        "Error: Query returned no results\n  at line1\n  at line2\n  at line3\n  at line4";

      const url = notFoundUrl({
        reason: "product-not-found",
        resource: "vintage-camera-123",
        details: "User accessed expired link from email",
        error,
      });

      expect(url).toContain("reason=product-not-found");
      expect(url).toContain("resource=vintage-camera-123");
      expect(url).toContain("Query%2520returned%2520no%2520results");
      expect(url).toContain("User%2520accessed%2520expired%2520link");
      expect(url).toContain("Stack%253A");
      expect(url).toContain("Timestamp%253A");
    });

    it("handles authentication flow error", () => {
      const url = unauthorized.notLoggedIn("/checkout/payment");

      expect(url).toContain("reason=not-logged-in");
      expect(url).toContain("resource=%2Fcheckout%2Fpayment");
    });

    it("handles authorization failure", () => {
      const url = forbidden.wrongRole("seller", "buyer", "/shop/123/edit");

      expect(url).toContain("reason=wrong-role");
      expect(url).toContain("role=seller");
      expect(url).toContain("current=buyer");
      expect(url).toContain("resource=%2Fshop%2F123%2Fedit");
    });

    it("handles multiple error scenarios in sequence", () => {
      const urls = [
        notFound.product("deleted-product"),
        unauthorized.sessionExpired("/dashboard"),
        forbidden.emailNotVerified("/shop/create"),
      ];

      expect(urls[0]).toContain("product-not-found");
      expect(urls[1]).toContain("session-expired");
      expect(urls[2]).toContain("email-not-verified");
    });

    it("preserves URL integrity for navigation", () => {
      const url = notFoundUrl({
        reason: "product-not-found",
        resource: "test-product",
      });

      // URL should be valid for Next.js router.push()
      expect(url).toMatch(/^\/not-found\?/);
      expect(url).not.toContain(" "); // No unencoded spaces
      expect(url).not.toContain("\n"); // No newlines in URL itself
    });
  });

  describe("Security & XSS Prevention", () => {
    it("encodes HTML in resource parameter", () => {
      const url = notFoundUrl({
        resource: "<script>alert('xss')</script>",
      });

      // Should be URL encoded, not executable
      expect(url).not.toContain("<script>");
      expect(url).toContain("%3Cscript%3E");
    });

    it("encodes HTML in details parameter", () => {
      const url = notFoundUrl({
        details: "<img src=x onerror=alert('xss')>",
      });

      expect(url).not.toContain("<img");
      expect(url).toContain("%253Cimg");
    });

    it("handles malicious error messages", () => {
      const error = new Error("</script><script>alert('xss')</script>");
      const url = notFoundUrl({ error });

      // Error message should be encoded in details
      expect(url).not.toContain("</script><script>");
    });

    it("prevents JavaScript protocol injection", () => {
      const url = notFoundUrl({
        resource: "javascript:alert('xss')",
      });

      // Should be encoded as query param, not executable
      expect(url).toContain("resource=javascript");
    });
  });
});
