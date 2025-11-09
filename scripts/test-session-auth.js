/**
 * Test Session Authentication API
 *
 * This script tests the session-based authentication endpoints
 * Make sure your dev server is running: npm run dev
 *
 * Usage:
 * node scripts/test-session-auth.js
 */

const BASE_URL = "http://localhost:3000/api";

// Store cookies between requests
let cookieJar = "";

/**
 * Make an HTTP request with cookie support
 */
async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Add cookies to request if available
  if (cookieJar) {
    options.headers["Cookie"] = cookieJar;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  // Extract and store cookies from response
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    // Simple cookie extraction (for testing purposes)
    const match = setCookie.match(/session=[^;]+/);
    if (match) {
      cookieJar = match[0];
    }
  }

  const data = await response.json();
  return { status: response.status, data };
}

/**
 * Test suite
 */
async function runTests() {
  console.log("=".repeat(80));
  console.log("SESSION AUTHENTICATION TEST SUITE");
  console.log("=".repeat(80));
  console.log("");

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  const testName = "Test User";

  try {
    // Test 1: Register new user
    console.log("📝 Test 1: Register new user");
    const registerResponse = await request("POST", "/auth/register", {
      email: testEmail,
      password: testPassword,
      name: testName,
    });

    if (registerResponse.status === 201) {
      console.log("✅ Registration successful");
      console.log("   User:", registerResponse.data.user.email);
      console.log("   Session ID:", registerResponse.data.sessionId);
      console.log("   Cookie set:", !!cookieJar);
    } else {
      console.log("❌ Registration failed:", registerResponse.data);
      return;
    }
    console.log("");

    // Test 2: Get current user with session
    console.log("📝 Test 2: Get current user (with session)");
    const meResponse = await request("GET", "/auth/me");

    if (meResponse.status === 200) {
      console.log("✅ Got current user");
      console.log("   User:", meResponse.data.user.email);
      console.log("   Session ID:", meResponse.data.session.sessionId);
    } else {
      console.log("❌ Failed to get user:", meResponse.data);
    }
    console.log("");

    // Test 3: Access protected route
    console.log("📝 Test 3: Access protected route");
    const protectedResponse = await request("GET", "/protected");

    if (protectedResponse.status === 200) {
      console.log("✅ Protected route accessible");
      console.log("   Message:", protectedResponse.data.message);
      console.log("   User ID:", protectedResponse.data.user.userId);
    } else {
      console.log("❌ Protected route failed:", protectedResponse.data);
    }
    console.log("");

    // Test 4: Get all sessions
    console.log("📝 Test 4: Get all user sessions");
    const sessionsResponse = await request("GET", "/auth/sessions");

    if (sessionsResponse.status === 200) {
      console.log("✅ Got user sessions");
      console.log("   Active sessions:", sessionsResponse.data.sessions.length);
      sessionsResponse.data.sessions.forEach((session, index) => {
        console.log(`   Session ${index + 1}:`, {
          id: session.sessionId.substring(0, 20) + "...",
          isCurrent: session.isCurrent,
          createdAt: session.createdAt,
        });
      });
    } else {
      console.log("❌ Failed to get sessions:", sessionsResponse.data);
    }
    console.log("");

    // Test 5: Logout
    console.log("📝 Test 5: Logout");
    const logoutResponse = await request("POST", "/auth/logout");

    if (logoutResponse.status === 200) {
      console.log("✅ Logout successful");
      console.log("   Message:", logoutResponse.data.message);
      console.log(
        "   Cookie cleared:",
        !cookieJar || cookieJar.includes("session=;"),
      );
    } else {
      console.log("❌ Logout failed:", logoutResponse.data);
    }
    console.log("");

    // Test 6: Try to access protected route after logout
    console.log("📝 Test 6: Access protected route after logout");
    const protectedAfterLogoutResponse = await request("GET", "/protected");

    if (protectedAfterLogoutResponse.status === 401) {
      console.log("✅ Protected route correctly blocked");
      console.log("   Error:", protectedAfterLogoutResponse.data.error);
    } else {
      console.log(
        "❌ Protected route should be blocked:",
        protectedAfterLogoutResponse.data,
      );
    }
    console.log("");

    // Test 7: Login with registered user
    console.log("📝 Test 7: Login with registered user");
    const loginResponse = await request("POST", "/auth/login", {
      email: testEmail,
      password: testPassword,
    });

    if (loginResponse.status === 200) {
      console.log("✅ Login successful");
      console.log("   User:", loginResponse.data.user.email);
      console.log("   Session ID:", loginResponse.data.sessionId);
      console.log("   Cookie set:", !!cookieJar);
    } else {
      console.log("❌ Login failed:", loginResponse.data);
    }
    console.log("");

    // Test 8: Access protected route after login
    console.log("📝 Test 8: Access protected route after login");
    const protectedAfterLoginResponse = await request("GET", "/protected");

    if (protectedAfterLoginResponse.status === 200) {
      console.log("✅ Protected route accessible after login");
      console.log("   User ID:", protectedAfterLoginResponse.data.user.userId);
    } else {
      console.log(
        "❌ Protected route failed:",
        protectedAfterLoginResponse.data,
      );
    }
    console.log("");

    console.log("=".repeat(80));
    console.log("✅ ALL TESTS COMPLETED SUCCESSFULLY");
    console.log("=".repeat(80));
  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
    console.error("");
    console.error("Make sure your dev server is running: npm run dev");
    console.error("=".repeat(80));
  }
}

// Run tests
runTests();
