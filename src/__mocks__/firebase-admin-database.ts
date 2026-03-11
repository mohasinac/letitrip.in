/**
 * Jest mock for firebase-admin/database
 */
export const getDatabase = jest.fn(() => ({
  ref: jest.fn(() => ({
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    once: jest.fn().mockResolvedValue({ val: () => null, exists: () => false }),
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn().mockResolvedValue(undefined),
    push: jest.fn().mockResolvedValue({ key: "mock-push-key" }),
  })),
}));
