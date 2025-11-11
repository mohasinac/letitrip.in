/**
 * Generate test authentication tokens for bulk action tests
 * Creates valid JWT tokens that can be used with the session system
 */

const jwt = require("jsonwebtoken");
const { serialize } = require("cookie");

const SESSION_SECRET =
  process.env.SESSION_SECRET || "your-secret-key-change-in-production";
const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Generate a test session token
 */
function generateTestToken(userId, email, role) {
  const sessionId = `test-sess-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}`;

  const token = jwt.sign(
    {
      userId,
      email,
      role,
      sessionId,
    },
    SESSION_SECRET,
    {
      expiresIn: SESSION_MAX_AGE,
    }
  );

  return { token, sessionId };
}

/**
 * Create session cookie header
 */
function createSessionCookie(token) {
  return serialize(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: false, // Set to false for local testing
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Generate admin test credentials
 */
function generateAdminAuth() {
  const { token } = generateTestToken(
    "test-admin-user-id",
    "admin@test.com",
    "admin"
  );

  return {
    headers: {
      "Content-Type": "application/json",
      Cookie: createSessionCookie(token),
    },
  };
}

/**
 * Generate seller test credentials
 */
function generateSellerAuth(sellerId = "test-seller") {
  const { token } = generateTestToken(
    sellerId,
    `${sellerId}@test.com`,
    "seller"
  );

  return {
    headers: {
      "Content-Type": "application/json",
      Cookie: createSessionCookie(token),
    },
  };
}

/**
 * Generate user test credentials
 */
function generateUserAuth(userId = "test-user") {
  const { token } = generateTestToken(userId, `${userId}@test.com`, "user");

  return {
    headers: {
      "Content-Type": "application/json",
      Cookie: createSessionCookie(token),
    },
  };
}

module.exports = {
  generateTestToken,
  createSessionCookie,
  generateAdminAuth,
  generateSellerAuth,
  generateUserAuth,
};
