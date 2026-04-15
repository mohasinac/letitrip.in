/**
 * Manual Jest mock for src/lib/firebase/admin.ts
 *
 * Prevents the firebase-admin ESM parse error (SyntaxError: Unexpected token 'export')
 * in test environments. Tests that need specific behavior should use jest.mock() with
 * a factory function — which takes precedence over this moduleNameMapper target.
 */

export const getAdminApp = jest.fn(() => ({}));
export const getAdminAuth = jest.fn(() => ({
  verifyIdToken: jest.fn(),
  verifySessionCookie: jest.fn(),
  createSessionCookie: jest.fn(),
  revokeRefreshTokens: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  setCustomUserClaims: jest.fn(),
}));
export const getAdminDb = jest.fn(() => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    where: jest.fn(() => ({ get: jest.fn(), orderBy: jest.fn() })),
    add: jest.fn(),
    get: jest.fn(),
  })),
  doc: jest.fn(),
  runTransaction: jest.fn(),
  batch: jest.fn(),
  settings: jest.fn(),
}));
export const getStorage = jest.fn(() => ({
  bucket: jest.fn(() => ({
    file: jest.fn(() => ({
      save: jest.fn(),
      delete: jest.fn(),
      getSignedUrl: jest.fn(),
      exists: jest.fn(),
    })),
  })),
}));
export const getAdminRealtimeDb = jest.fn(() => ({
  ref: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    once: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn(),
  })),
}));

