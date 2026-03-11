/**
 * Jest mock for @/lib/security/authorization
 *
 * Default behaviour:
 *   - requireAuthFromRequest / getUserFromRequest: returns a mock UserDocument
 *     if the request has an "__session" cookie (any non-empty value).
 *     Returns null / throws AuthenticationError when no cookie is present so
 *     tests that assert on 401 remain correct without any extra overrides.
 *   - requireRoleFromRequest: same as above, but always returns a user with
 *     role "admin" so admin-route tests don't need to set a specific role.
 *
 * Individual tests that need different behaviour should call:
 *   jest.mock("@/lib/security/authorization", () => ({ requireAuthFromRequest: jest.fn()... }))
 * inside the test file – that factory call overrides this global mock.
 */

const MOCK_USER = {
  uid: "mock-uid",
  email: "mock@test.com",
  role: "admin" as const,
  displayName: "Mock User",
  emailVerified: true,
  disabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function hasSession(request: any): boolean {
  try {
    return !!request?.cookies?.get?.("__session")?.value;
  } catch {
    return false;
  }
}

export const getUserFromRequest = jest.fn(async (request: any) => {
  return hasSession(request) ? MOCK_USER : null;
});

export const requireAuthFromRequest = jest.fn(async (request: any) => {
  if (!hasSession(request)) {
    const err: any = new Error("Not authenticated");
    err.statusCode = 401;
    err.code = "AUTH_ERROR";
    throw err;
  }
  return MOCK_USER;
});

export const requireRoleFromRequest = jest.fn(
  async (request: any, _roles: unknown) => {
    if (!hasSession(request)) {
      const err: any = new Error("Not authenticated");
      err.statusCode = 401;
      err.code = "AUTH_ERROR";
      throw err;
    }
    return MOCK_USER;
  },
);

export const requireAuth = jest.fn();
export const requireRole = jest.fn();
export const requireOwnership = jest.fn();
export const requireEmailVerified = jest.fn();
export const requireActiveAccount = jest.fn();
export const canChangeRole = jest.fn().mockReturnValue(true);
export const requireRoleOrOwnership = jest.fn();
