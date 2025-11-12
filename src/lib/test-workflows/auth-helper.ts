/**
 * Test Workflow Authentication Helper
 *
 * Provides utilities for managing authentication in workflow tests
 * - Detects if user is authenticated
 * - Handles public vs protected API calls
 * - Provides clear error messages for auth failures
 */

interface AuthCheckResult {
  isAuthenticated: boolean;
  userId?: string;
  userRole?: string;
  error?: string;
}

/**
 * Check if the current session is authenticated
 * This works client-side by checking localStorage
 */
export function checkAuthentication(): AuthCheckResult {
  if (typeof window === "undefined") {
    // Server-side: Cannot check localStorage
    return {
      isAuthenticated: false,
      error: "Authentication check only available client-side",
    };
  }

  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return { isAuthenticated: false };
    }

    const user = JSON.parse(userStr);
    if (!user.id) {
      return { isAuthenticated: false };
    }

    return {
      isAuthenticated: true,
      userId: user.id,
      userRole: user.role,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      error: "Failed to parse user data",
    };
  }
}

/**
 * Determine if a workflow step should be skipped based on auth requirements
 */
export function shouldSkipAuthStep(
  requiresAuth: boolean,
  skipAuthSteps: boolean = true
): boolean {
  if (!requiresAuth) {
    return false; // Public steps never skipped
  }

  const auth = checkAuthentication();

  if (auth.isAuthenticated) {
    return false; // User is authenticated, don't skip
  }

  return skipAuthSteps; // Skip if configured to skip auth steps
}

/**
 * Get a descriptive message for auth-related errors
 */
export function getAuthErrorMessage(error: any, requiresAuth: boolean): string {
  const isAuthError =
    error.status === 401 || error.message?.includes("Unauthorized");

  if (isAuthError && requiresAuth) {
    return "⏭️ Skipped: This step requires authentication. Please log in to test this functionality.";
  }

  if (isAuthError && !requiresAuth) {
    return "❌ Unexpected authentication error on public endpoint. This should not require auth.";
  }

  return `❌ Error: ${error.message || "Unknown error"}`;
}

/**
 * Validate that public APIs work without authentication
 */
export async function validatePublicAccess(endpoint: string): Promise<boolean> {
  try {
    // Make a fetch request without auth headers
    const response = await fetch(endpoint, {
      method: "GET",
      credentials: "omit", // Don't send cookies
    });

    if (response.status === 401) {
      console.error(
        `❌ Public endpoint ${endpoint} requires authentication (should be public)`
      );
      return false;
    }

    if (!response.ok) {
      console.warn(
        `⚠️ Public endpoint ${endpoint} returned status ${response.status}`
      );
      return false;
    }

    console.log(`✅ Public endpoint ${endpoint} accessible without auth`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to access public endpoint ${endpoint}:`, error);
    return false;
  }
}

/**
 * Test suite for verifying public API access
 */
export async function testPublicAPIs(): Promise<{
  passed: number;
  failed: number;
  results: Array<{ endpoint: string; success: boolean }>;
}> {
  const publicEndpoints = [
    "/api/products?status=published&limit=10",
    "/api/shops?verified=true&limit=10",
    "/api/categories?show_on_homepage=true",
    "/api/blog?status=published&limit=5",
    "/api/auctions?status=active&limit=10",
  ];

  const results = [];
  let passed = 0;
  let failed = 0;

  console.log("\n🌐 Testing Public API Access (No Authentication)");
  console.log("=".repeat(60));

  for (const endpoint of publicEndpoints) {
    const success = await validatePublicAccess(endpoint);
    results.push({ endpoint, success });

    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log("=".repeat(60));
  console.log(`✅ Passed: ${passed}/${publicEndpoints.length}`);
  console.log(`❌ Failed: ${failed}/${publicEndpoints.length}`);
  console.log("=".repeat(60) + "\n");

  return { passed, failed, results };
}

/**
 * Get authentication status for logging
 */
export function getAuthStatus(): string {
  const auth = checkAuthentication();

  if (!auth.isAuthenticated) {
    return "🌐 Not Authenticated (Public Access Only)";
  }

  return `🔒 Authenticated as ${auth.userRole || "user"} (${auth.userId})`;
}
