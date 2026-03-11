/**
 * Jest mock for firebase-admin/storage
 */
export const getStorage = jest.fn(() => ({
  bucket: jest.fn(() => ({
    file: jest.fn(() => ({
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      getSignedUrl: jest.fn().mockResolvedValue(["https://mock-url.com"]),
      exists: jest.fn().mockResolvedValue([false]),
      createWriteStream: jest.fn(),
    })),
    getFiles: jest.fn().mockResolvedValue([[]]),
  })),
}));
