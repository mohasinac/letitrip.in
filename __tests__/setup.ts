// Test setup file - runs before all tests
import '@testing-library/jest-dom';

// Set environment variables for testing
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
Object.defineProperty(process.env, 'FIREBASE_PROJECT_ID', { value: 'test-project', writable: true });

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => {
  const mockTimestamp = {
    now: () => ({ seconds: Date.now() / 1000, nanoseconds: 0 }),
    fromDate: (date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 }),
  };

  return {
    apps: [],
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    firestore: () => ({
      collection: jest.fn(),
      doc: jest.fn(),
      batch: jest.fn(),
      runTransaction: jest.fn(),
      Timestamp: mockTimestamp,
      FieldValue: {
        serverTimestamp: () => 'SERVER_TIMESTAMP',
        delete: () => 'DELETE_FIELD',
        increment: (n: number) => `INCREMENT_${n}`,
        arrayUnion: (...elements: any[]) => ({ _elements: elements, _type: 'arrayUnion' }),
        arrayRemove: (...elements: any[]) => ({ _elements: elements, _type: 'arrayRemove' }),
      },
    }),
    auth: () => ({
      verifyIdToken: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    }),
    storage: () => ({
      bucket: jest.fn(),
    }),
  };
});

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
