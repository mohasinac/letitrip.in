/**
 * Jest mock for firebase-admin/auth
 */
export const getAuth = jest.fn(() => ({
  verifyIdToken: jest.fn().mockResolvedValue({ uid: "mock-uid" }),
  verifySessionCookie: jest.fn().mockResolvedValue({ uid: "mock-uid" }),
  createSessionCookie: jest.fn().mockResolvedValue("mock-cookie"),
  revokeRefreshTokens: jest.fn().mockResolvedValue(undefined),
  getUser: jest
    .fn()
    .mockResolvedValue({ uid: "mock-uid", email: "mock@test.com" }),
  updateUser: jest.fn().mockResolvedValue({}),
  deleteUser: jest.fn().mockResolvedValue(undefined),
  setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
  createCustomToken: jest.fn().mockResolvedValue("mock-custom-token"),
}));
