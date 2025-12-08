/**
 * Tests for Error Redirect Utilities
 * Tests URL builders and helper objects for error pages (404, 401, 403)
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

describe("Error Redirect Utilities", () => {
  describe("notFoundUrl", () => {
    it("should generate basic 404 URL without params", () => {
      const url = notFoundUrl({});
      expect(url).toMatch(/^\/not-found\?/);
    });

    it("should include reason in URL", () => {
      const url = notFoundUrl({ reason: "product-not-found" });
      expect(url).toContain("reason=product-not-found");
    });

    it("should include resource in URL", () => {
      const url = notFoundUrl({ resource: "test-product" });
      expect(url).toContain("resource=test-product");
    });

    it("should include both reason and resource", () => {
      const url = notFoundUrl({
        reason: "product-not-found",
        resource: "test-product",
      });
      expect(url).toContain("reason=product-not-found");
      expect(url).toContain("resource=test-product");
    });

    it("should encode details with resource info", () => {
      const url = notFoundUrl({
        resource: "test-product",
      });
      expect(url).toContain("details=");
      // Details are double-encoded: once by encodeURIComponent, then by URLSearchParams
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Resource: test-product");
      expect(decoded).toContain("Timestamp:");
    });

    it("should include Error object message in details", () => {
      const error = new Error("Test error message");
      const url = notFoundUrl({
        resource: "test-product",
        error,
      });
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Error: Test error message");
    });

    it("should include Error stack trace in details", () => {
      const error = new Error("Test error");
      error.stack =
        "Error: Test error\n    at line1\n    at line2\n    at line3\n    at line4";
      const url = notFoundUrl({
        error,
      });
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Stack:");
      expect(decoded).toContain("at line1");
      expect(decoded).toContain("at line2");
      // Should only include first 3 lines of stack (Error line + 2 stack frames)
      expect(decoded).not.toContain("at line3");
      expect(decoded).not.toContain("at line4");
    });

    it("should handle non-Error error objects", () => {
      const url = notFoundUrl({
        error: "String error",
      });
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Error: String error");
    });

    it("should include custom details", () => {
      const url = notFoundUrl({
        details: "Custom detail message",
      });
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Custom detail message");
    });

    it("should combine all detail parts", () => {
      const error = new Error("Test error");
      const url = notFoundUrl({
        resource: "test-product",
        error,
        details: "Additional info",
      });
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Resource: test-product");
      expect(decoded).toContain("Error: Test error");
      expect(decoded).toContain("Additional info");
      expect(decoded).toContain("Timestamp:");
    });

    it("should handle all 404 reason types", () => {
      const reasons: ErrorReason[] = [
        "product-not-found",
        "shop-not-found",
        "auction-not-found",
        "category-not-found",
        "user-not-found",
        "order-not-found",
      ];

      reasons.forEach((reason) => {
        const url = notFoundUrl({ reason });
        expect(url).toContain(`reason=${reason}`);
      });
    });
  });

  describe("unauthorizedUrl", () => {
    it("should generate basic 401 URL without params", () => {
      const url = unauthorizedUrl({});
      expect(url).toMatch(/^\/unauthorized\?/);
    });

    it("should include reason in URL", () => {
      const url = unauthorizedUrl({ reason: "not-logged-in" });
      expect(url).toContain("reason=not-logged-in");
    });

    it("should include resource in URL", () => {
      const url = unauthorizedUrl({ resource: "/admin/products" });
      expect(url).toContain("resource=%2Fadmin%2Fproducts");
    });

    it("should include requiredRole in URL", () => {
      const url = unauthorizedUrl({ requiredRole: "admin" });
      expect(url).toContain("role=admin");
    });

    it("should include all params", () => {
      const url = unauthorizedUrl({
        reason: "not-logged-in",
        resource: "/admin",
        requiredRole: "admin",
      });
      expect(url).toContain("reason=not-logged-in");
      expect(url).toContain("resource=%2Fadmin");
      expect(url).toContain("role=admin");
    });

    it("should encode details with resource and role info", () => {
      const url = unauthorizedUrl({
        resource: "/admin",
        requiredRole: "admin",
      });
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Resource: /admin");
      expect(decoded).toContain("Required Role: admin");
      expect(decoded).toContain("Timestamp:");
    });

    it("should include Error object in details", () => {
      const error = new Error("Auth error");
      const url = unauthorizedUrl({
        error,
      });
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Error: Auth error");
    });

    it("should include custom details", () => {
      const url = unauthorizedUrl({
        details: "Token expired 5 minutes ago",
      });
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Token expired 5 minutes ago");
    });

    it("should handle all 401 reason types", () => {
      const reasons: ErrorReason[] = [
        "not-logged-in",
        "session-expired",
        "invalid-token",
      ];

      reasons.forEach((reason) => {
        const url = unauthorizedUrl({ reason });
        expect(url).toContain(`reason=${reason}`);
      });
    });
  });

  describe("forbiddenUrl", () => {
    it("should generate basic 403 URL without params", () => {
      const url = forbiddenUrl({});
      expect(url).toMatch(/^\/forbidden\?/);
    });

    it("should include reason in URL", () => {
      const url = forbiddenUrl({ reason: "wrong-role" });
      expect(url).toContain("reason=wrong-role");
    });

    it("should include resource in URL", () => {
      const url = forbiddenUrl({ resource: "/admin/users" });
      expect(url).toContain("resource=%2Fadmin%2Fusers");
    });

    it("should include requiredRole in URL", () => {
      const url = forbiddenUrl({ requiredRole: "admin" });
      expect(url).toContain("role=admin");
    });

    it("should include currentRole in URL", () => {
      const url = forbiddenUrl({ currentRole: "user" });
      expect(url).toContain("current=user");
    });

    it("should include all params", () => {
      const url = forbiddenUrl({
        reason: "wrong-role",
        resource: "/admin",
        requiredRole: "admin",
        currentRole: "user",
      });
      expect(url).toContain("reason=wrong-role");
      expect(url).toContain("resource=%2Fadmin");
      expect(url).toContain("role=admin");
      expect(url).toContain("current=user");
    });

    it("should encode details with resource and roles", () => {
      const url = forbiddenUrl({
        resource: "/admin",
        requiredRole: "admin",
        currentRole: "user",
      });
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Resource: /admin");
      expect(decoded).toContain("Required Role: admin");
      expect(decoded).toContain("Current Role: user");
      expect(decoded).toContain("Timestamp:");
    });

    it("should include Error object in details", () => {
      const error = new Error("Permission denied");
      const url = forbiddenUrl({
        error,
      });
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Error: Permission denied");
    });

    it("should include custom details", () => {
      const url = forbiddenUrl({
        details: "Account suspended due to policy violation",
      });
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Account suspended due to policy violation");
    });

    it("should handle all 403 reason types", () => {
      const reasons: ErrorReason[] = [
        "insufficient-permissions",
        "wrong-role",
        "account-suspended",
        "email-not-verified",
      ];

      reasons.forEach((reason) => {
        const url = forbiddenUrl({ reason });
        expect(url).toContain(`reason=${reason}`);
      });
    });
  });

  describe("notFound helper object", () => {
    it("should generate product not found URL", () => {
      const url = notFound.product("test-product-slug");
      expect(url).toContain("reason=product-not-found");
      expect(url).toContain("resource=test-product-slug");
    });

    it("should generate product not found URL with error", () => {
      const error = new Error("Product fetch failed");
      const url = notFound.product("test-product", error);
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Error: Product fetch failed");
    });

    it("should generate shop not found URL", () => {
      const url = notFound.shop("test-shop-slug");
      expect(url).toContain("reason=shop-not-found");
      expect(url).toContain("resource=test-shop-slug");
    });

    it("should generate shop not found URL with error", () => {
      const error = new Error("Shop fetch failed");
      const url = notFound.shop("test-shop", error);
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Error: Shop fetch failed");
    });

    it("should generate auction not found URL", () => {
      const url = notFound.auction("test-auction-slug");
      expect(url).toContain("reason=auction-not-found");
      expect(url).toContain("resource=test-auction-slug");
    });

    it("should generate auction not found URL with error", () => {
      const error = new Error("Auction fetch failed");
      const url = notFound.auction("test-auction", error);
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Error: Auction fetch failed");
    });

    it("should generate category not found URL", () => {
      const url = notFound.category("test-category-slug");
      expect(url).toContain("reason=category-not-found");
      expect(url).toContain("resource=test-category-slug");
    });

    it("should generate category not found URL with error", () => {
      const error = new Error("Category fetch failed");
      const url = notFound.category("test-category", error);
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Error: Category fetch failed");
    });

    it("should generate order not found URL", () => {
      const url = notFound.order("ORDER123");
      expect(url).toContain("reason=order-not-found");
      expect(url).toContain("resource=ORDER123");
    });

    it("should generate order not found URL with error", () => {
      const error = new Error("Order fetch failed");
      const url = notFound.order("ORDER123", error);
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Error: Order fetch failed");
    });
  });

  describe("unauthorized helper object", () => {
    it("should generate not logged in URL", () => {
      const url = unauthorized.notLoggedIn();
      expect(url).toContain("reason=not-logged-in");
    });

    it("should generate not logged in URL with resource", () => {
      const url = unauthorized.notLoggedIn("/admin/products");
      expect(url).toContain("reason=not-logged-in");
      expect(url).toContain("resource=%2Fadmin%2Fproducts");
    });

    it("should generate session expired URL", () => {
      const url = unauthorized.sessionExpired();
      expect(url).toContain("reason=session-expired");
    });

    it("should generate session expired URL with resource", () => {
      const url = unauthorized.sessionExpired("/checkout");
      expect(url).toContain("reason=session-expired");
      expect(url).toContain("resource=%2Fcheckout");
    });

    it("should generate invalid token URL", () => {
      const url = unauthorized.invalidToken();
      expect(url).toContain("reason=invalid-token");
    });

    it("should generate invalid token URL with resource", () => {
      const url = unauthorized.invalidToken("/api/user");
      expect(url).toContain("reason=invalid-token");
      expect(url).toContain("resource=%2Fapi%2Fuser");
    });

    it("should generate invalid token URL with error", () => {
      const error = new Error("JWT verification failed");
      const url = unauthorized.invalidToken("/api/user", error);
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Error: JWT verification failed");
    });
  });

  describe("forbidden helper object", () => {
    it("should generate wrong role URL", () => {
      const url = forbidden.wrongRole("admin", "user");
      expect(url).toContain("reason=wrong-role");
      expect(url).toContain("role=admin");
      expect(url).toContain("current=user");
    });

    it("should generate wrong role URL with resource", () => {
      const url = forbidden.wrongRole("admin", "user", "/admin/settings");
      expect(url).toContain("reason=wrong-role");
      expect(url).toContain("role=admin");
      expect(url).toContain("current=user");
      expect(url).toContain("resource=%2Fadmin%2Fsettings");
    });

    it("should generate wrong role URL without current role", () => {
      const url = forbidden.wrongRole("admin");
      expect(url).toContain("reason=wrong-role");
      expect(url).toContain("role=admin");
      expect(url).not.toContain("current=");
    });

    it("should generate insufficient permissions URL", () => {
      const url = forbidden.insufficientPermissions();
      expect(url).toContain("reason=insufficient-permissions");
    });

    it("should generate insufficient permissions URL with role", () => {
      const url = forbidden.insufficientPermissions("moderator");
      expect(url).toContain("reason=insufficient-permissions");
      expect(url).toContain("role=moderator");
    });

    it("should generate insufficient permissions URL with resource", () => {
      const url = forbidden.insufficientPermissions(
        "moderator",
        "/admin/users"
      );
      expect(url).toContain("reason=insufficient-permissions");
      expect(url).toContain("role=moderator");
      expect(url).toContain("resource=%2Fadmin%2Fusers");
    });

    it("should generate account suspended URL", () => {
      const url = forbidden.accountSuspended();
      expect(url).toContain("reason=account-suspended");
    });

    it("should generate account suspended URL with details", () => {
      const url = forbidden.accountSuspended("Policy violation: spam activity");
      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Policy violation: spam activity");
    });

    it("should generate email not verified URL", () => {
      const url = forbidden.emailNotVerified();
      expect(url).toContain("reason=email-not-verified");
    });

    it("should generate email not verified URL with resource", () => {
      const url = forbidden.emailNotVerified("/seller/dashboard");
      expect(url).toContain("reason=email-not-verified");
      expect(url).toContain("resource=%2Fseller%2Fdashboard");
    });
  });

  describe("URL encoding", () => {
    it("should properly encode special characters in resource", () => {
      const url = notFoundUrl({
        resource: "product/with/slashes and spaces",
      });
      expect(url).toContain("resource=product%2Fwith%2Fslashes+and+spaces");
    });

    it("should properly encode details parameter", () => {
      const url = notFoundUrl({
        details: "Error: Something went wrong!\nLine 2\nLine 3",
      });
      expect(url).toContain("details=");
      // Details should be URL encoded
      expect(url).not.toContain("\n");
    });

    it("should handle unicode characters in resource", () => {
      const url = notFoundUrl({
        resource: "product-名前-नाम",
      });
      expect(url).toContain("resource=");
      // Should be properly encoded
      expect(decodeURIComponent(url)).toContain("product-名前-नाम");
    });
  });

  describe("timestamp inclusion", () => {
    it("should include ISO timestamp in details", () => {
      const beforeTime = new Date().toISOString();
      const url = notFoundUrl({});
      const afterTime = new Date().toISOString();

      const decoded = decodeURIComponent(
        decodeURIComponent(url.split("details=")[1])
      );
      expect(decoded).toContain("Timestamp:");

      // Extract timestamp from details
      const timestampMatch = decoded.match(/Timestamp: (.+)$/);
      expect(timestampMatch).toBeTruthy();
      if (timestampMatch) {
        const timestamp = timestampMatch[1];
        // Verify it's a valid ISO string and within test time range
        expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        expect(timestamp >= beforeTime).toBe(true);
        expect(timestamp <= afterTime).toBe(true);
      }
    });
  });
});
