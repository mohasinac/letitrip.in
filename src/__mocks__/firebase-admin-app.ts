/**
 * Jest mock for firebase-admin/app
 * Prevents SyntaxError: Unexpected token 'export' from jwks-rsa / firebase-admin ESM files.
 * Tests that call jest.mock("firebase-admin/app", ...) override this automatically.
 */
export const initializeApp = jest.fn(() => ({}));
export const getApps = jest.fn(() => []);
export const getApp = jest.fn(() => ({}));
export const cert = jest.fn((x: unknown) => x);
export const deleteApp = jest.fn();

