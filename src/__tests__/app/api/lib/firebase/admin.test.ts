/**
 * Unit Tests: Firebase Admin SDK Configuration
 * File: src/app/api/lib/firebase/admin.ts
 */

import {
  getAuthAdmin,
  getFirestoreAdmin,
  getStorageAdmin,
  initializeFirebaseAdmin,
  verifyFirebaseAdmin,
} from "@/app/api/lib/firebase/admin";

// Mock firebase-admin modules
jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(),
  cert: jest.fn((creds) => creds),
}));

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(),
}));

jest.mock("firebase-admin/auth", () => ({
  getAuth: jest.fn(),
}));

jest.mock("firebase-admin/storage", () => ({
  getStorage: jest.fn(),
}));

describe("Firebase Admin SDK", () => {
  let mockApp: any;
  let mockDb: any;
  let mockAuth: any;
  let mockStorage: any;
  let originalEnv: NodeJS.ProcessEnv;

  const validEnv = {
    FIREBASE_PROJECT_ID: "test-project",
    FIREBASE_CLIENT_EMAIL: "test@test-project.iam.gserviceaccount.com",
    FIREBASE_PRIVATE_KEY:
      "-----BEGIN PRIVATE KEY-----\\ntest-key\\n-----END PRIVATE KEY-----",
    FIREBASE_STORAGE_BUCKET: "test-project.appspot.com",
  };

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("FIREBASE_") || key.startsWith("FIRESTORE_")) {
        delete process.env[key];
      }
    });

    // Setup mocks
    mockApp = { name: "test-app" };
    mockDb = {
      settings: jest.fn(),
      collection: jest.fn(),
    };
    mockAuth = { verifyIdToken: jest.fn() };
    mockStorage = { bucket: jest.fn() };

    const { initializeApp, getApps } = require("firebase-admin/app");
    const { getFirestore } = require("firebase-admin/firestore");
    const { getAuth } = require("firebase-admin/auth");
    const { getStorage } = require("firebase-admin/storage");

    (getApps as jest.Mock).mockReturnValue([]);
    (initializeApp as jest.Mock).mockReturnValue(mockApp);
    (getFirestore as jest.Mock).mockReturnValue(mockDb);
    (getAuth as jest.Mock).mockReturnValue(mockAuth);
    (getStorage as jest.Mock).mockReturnValue(mockStorage);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("initializeFirebaseAdmin", () => {
    it("should initialize Firebase Admin with all credentials", () => {
      Object.assign(process.env, validEnv);

      const result = initializeFirebaseAdmin();

      expect(result).toEqual({
        app: mockApp,
        db: mockDb,
        auth: mockAuth,
        storage: mockStorage,
      });
    });

    it("should call initializeApp with correct credentials", () => {
      const { initializeApp, cert } = require("firebase-admin/app");
      Object.assign(process.env, validEnv);

      initializeFirebaseAdmin();

      expect(cert).toHaveBeenCalledWith({
        projectId: "test-project",
        clientEmail: "test@test-project.iam.gserviceaccount.com",
        privateKey:
          "-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----",
      });

      expect(initializeApp).toHaveBeenCalledWith({
        credential: {
          projectId: "test-project",
          clientEmail: "test@test-project.iam.gserviceaccount.com",
          privateKey:
            "-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----",
        },
        storageBucket: "test-project.appspot.com",
      });
    });

    it("should replace \\\\n with actual newlines in private key", () => {
      const { cert } = require("firebase-admin/app");
      Object.assign(process.env, validEnv);

      initializeFirebaseAdmin();

      const certCall = (cert as jest.Mock).mock.calls[0][0];
      expect(certCall.privateKey).not.toContain("\\n");
      expect(certCall.privateKey).toContain("\n");
    });

    it("should use default storage bucket if not provided", () => {
      const { initializeApp } = require("firebase-admin/app");
      Object.assign(process.env, validEnv);
      delete process.env.FIREBASE_STORAGE_BUCKET;

      initializeFirebaseAdmin();

      const initCall = (initializeApp as jest.Mock).mock.calls[0][0];
      expect(initCall.storageBucket).toBe("test-project.appspot.com");
    });

    it("should throw error if project ID is missing", () => {
      Object.assign(process.env, validEnv);
      delete process.env.FIREBASE_PROJECT_ID;

      expect(() => initializeFirebaseAdmin()).toThrow(
        "Firebase Admin not configured"
      );
    });

    it("should throw error if client email is missing", () => {
      Object.assign(process.env, validEnv);
      delete process.env.FIREBASE_CLIENT_EMAIL;

      expect(() => initializeFirebaseAdmin()).toThrow(
        "Firebase Admin not configured"
      );
    });

    it("should throw error if private key is missing", () => {
      Object.assign(process.env, validEnv);
      delete process.env.FIREBASE_PRIVATE_KEY;

      expect(() => initializeFirebaseAdmin()).toThrow(
        "Firebase Admin not configured"
      );
    });

    it("should configure Firestore with ignoreUndefinedProperties", () => {
      Object.assign(process.env, validEnv);

      initializeFirebaseAdmin();

      expect(mockDb.settings).toHaveBeenCalledWith({
        ignoreUndefinedProperties: true,
      });
    });

    it("should log emulator usage when FIRESTORE_EMULATOR_HOST is set", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      Object.assign(process.env, validEnv);
      process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

      initializeFirebaseAdmin();

      const allLogs = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allLogs).toContain("emulator");
      expect(allLogs).toContain("localhost:8080");

      consoleSpy.mockRestore();
    });

    it("should return existing app if already initialized", () => {
      const { getApps } = require("firebase-admin/app");
      Object.assign(process.env, validEnv);

      // First initialization
      initializeFirebaseAdmin();

      // Mock as already initialized
      (getApps as jest.Mock).mockReturnValue([mockApp]);

      // Second initialization should reuse
      const result = initializeFirebaseAdmin();

      expect(result.app).toBe(mockApp);
    });

    it("should handle multiple initialization calls gracefully", () => {
      const { getApps, initializeApp } = require("firebase-admin/app");
      Object.assign(process.env, validEnv);

      // First call
      (getApps as jest.Mock).mockReturnValue([]);
      initializeFirebaseAdmin();

      // Second call - should use existing app
      (getApps as jest.Mock).mockReturnValue([mockApp]);
      initializeFirebaseAdmin();

      // initializeApp should only be called once
      expect(initializeApp).toHaveBeenCalledTimes(1);
    });

    it("should log warning when credentials are missing", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      expect(() => initializeFirebaseAdmin()).toThrow();

      const allWarnings = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allWarnings).toContain("missing required env vars");

      consoleSpy.mockRestore();
    });
  });

  describe("getFirestoreAdmin", () => {
    it("should return Firestore instance if already initialized", () => {
      Object.assign(process.env, validEnv);
      initializeFirebaseAdmin();

      const result = getFirestoreAdmin();

      expect(result).toBe(mockDb);
    });

    it("should return the same instance on multiple calls", () => {
      Object.assign(process.env, validEnv);

      const first = getFirestoreAdmin();
      const second = getFirestoreAdmin();

      expect(first).toBe(second);
    });
  });

  describe("getAuthAdmin", () => {
    it("should return Auth instance if already initialized", () => {
      Object.assign(process.env, validEnv);
      initializeFirebaseAdmin();

      const result = getAuthAdmin();

      expect(result).toBe(mockAuth);
    });

    it("should return the same instance on multiple calls", () => {
      Object.assign(process.env, validEnv);

      const first = getAuthAdmin();
      const second = getAuthAdmin();

      expect(first).toBe(second);
    });
  });

  describe("getStorageAdmin", () => {
    it("should return Storage instance if already initialized", () => {
      Object.assign(process.env, validEnv);
      initializeFirebaseAdmin();

      const result = getStorageAdmin();

      expect(result).toBe(mockStorage);
    });

    it("should return the same instance on multiple calls", () => {
      Object.assign(process.env, validEnv);

      const first = getStorageAdmin();
      const second = getStorageAdmin();

      expect(first).toBe(second);
    });
  });

  describe("verifyFirebaseAdmin", () => {
    it("should return true when all required env vars are present", () => {
      Object.assign(process.env, validEnv);

      const result = verifyFirebaseAdmin();

      expect(result).toBe(true);
    });

    it("should return false when FIREBASE_PROJECT_ID is missing", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      Object.assign(process.env, validEnv);
      delete process.env.FIREBASE_PROJECT_ID;

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);
      const allErrors = consoleErrorSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allErrors).toContain("FIREBASE_PROJECT_ID");

      consoleErrorSpy.mockRestore();
    });

    it("should return false when FIREBASE_CLIENT_EMAIL is missing", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      Object.assign(process.env, validEnv);
      delete process.env.FIREBASE_CLIENT_EMAIL;

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);
      const allErrors = consoleErrorSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allErrors).toContain("FIREBASE_CLIENT_EMAIL");

      consoleErrorSpy.mockRestore();
    });

    it("should return false when FIREBASE_PRIVATE_KEY is missing", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      Object.assign(process.env, validEnv);
      delete process.env.FIREBASE_PRIVATE_KEY;

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);
      const allErrors = consoleErrorSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allErrors).toContain("FIREBASE_PRIVATE_KEY");

      consoleErrorSpy.mockRestore();
    });

    it("should return false when FIREBASE_STORAGE_BUCKET is missing", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      Object.assign(process.env, validEnv);
      delete process.env.FIREBASE_STORAGE_BUCKET;

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);
      const allErrors = consoleErrorSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allErrors).toContain("FIREBASE_STORAGE_BUCKET");

      consoleErrorSpy.mockRestore();
    });

    it("should list all missing environment variables", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);
      const allErrors = consoleErrorSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allErrors).toContain("FIREBASE_PROJECT_ID");
      expect(allErrors).toContain("FIREBASE_CLIENT_EMAIL");
      expect(allErrors).toContain("FIREBASE_PRIVATE_KEY");
      expect(allErrors).toContain("FIREBASE_STORAGE_BUCKET");

      consoleErrorSpy.mockRestore();
    });

    it("should handle errors during verification gracefully", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Force an error by making process.env throw
      const originalEnv = process.env;
      Object.defineProperty(global, "process", {
        get() {
          throw new Error("Test error");
        },
        configurable: true,
      });

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);

      // Restore
      Object.defineProperty(global, "process", {
        value: { env: originalEnv },
        configurable: true,
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string env vars as missing", () => {
      Object.assign(process.env, validEnv);
      process.env.FIREBASE_PROJECT_ID = "";

      expect(() => initializeFirebaseAdmin()).toThrow(
        "Firebase Admin not configured"
      );
    });

    it("should handle whitespace-only private keys", () => {
      const { cert } = require("firebase-admin/app");
      Object.assign(process.env, validEnv);
      process.env.FIREBASE_PRIVATE_KEY = "   ";

      initializeFirebaseAdmin();

      const certCall = (cert as jest.Mock).mock.calls[0][0];
      expect(certCall.privateKey).toBe("   ");
    });

    it("should handle private key with multiple \\\\n sequences", () => {
      const { cert } = require("firebase-admin/app");
      Object.assign(process.env, validEnv);
      process.env.FIREBASE_PRIVATE_KEY = "line1\\nline2\\nline3\\nline4";

      initializeFirebaseAdmin();

      const certCall = (cert as jest.Mock).mock.calls[0][0];
      expect(certCall.privateKey).toBe("line1\nline2\nline3\nline4");
      expect(certCall.privateKey.split("\n")).toHaveLength(4);
    });

    it("should handle very long storage bucket names", () => {
      const { initializeApp } = require("firebase-admin/app");
      Object.assign(process.env, validEnv);
      process.env.FIREBASE_STORAGE_BUCKET = "a".repeat(200) + ".appspot.com";

      initializeFirebaseAdmin();

      const initCall = (initializeApp as jest.Mock).mock.calls[0][0];
      expect(initCall.storageBucket).toHaveLength(212); // 200 + ".appspot.com" = 212
    });

    it("should handle special characters in client email", () => {
      const { cert } = require("firebase-admin/app");
      Object.assign(process.env, validEnv);
      process.env.FIREBASE_CLIENT_EMAIL =
        "test+special@test-project.iam.gserviceaccount.com";

      initializeFirebaseAdmin();

      const certCall = (cert as jest.Mock).mock.calls[0][0];
      expect(certCall.clientEmail).toContain("+special");
    });
  });
});
