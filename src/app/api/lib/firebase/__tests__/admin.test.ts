import { deleteApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import {
  getAuthAdmin,
  getFirestoreAdmin,
  getStorageAdmin,
  initializeFirebaseAdmin,
  verifyFirebaseAdmin,
} from "../admin";

// Mock Firebase Admin modules
jest.mock("firebase-admin/app");
jest.mock("firebase-admin/firestore");
jest.mock("firebase-admin/auth");
jest.mock("firebase-admin/storage");

describe("Firebase Admin SDK", () => {
  const originalEnv = process.env;
  const mockApp = { name: "test-app" };
  const mockDb = { settings: jest.fn() };
  const mockAuth = { name: "test-auth" };
  const mockStorage = { name: "test-storage" };

  const mockGetApps = getApps as jest.MockedFunction<typeof getApps>;
  const mockDeleteApp = deleteApp as jest.MockedFunction<typeof deleteApp>;
  const mockGetFirestore = getFirestore as jest.MockedFunction<
    typeof getFirestore
  >;
  const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>;
  const mockGetStorage = getStorage as jest.MockedFunction<typeof getStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    // Default mock implementations
    mockGetApps.mockReturnValue([]);
    mockGetFirestore.mockReturnValue(mockDb as any);
    mockGetAuth.mockReturnValue(mockAuth as any);
    mockGetStorage.mockReturnValue(mockStorage as any);

    // Mock cert and initializeApp
    const { cert, initializeApp } = require("firebase-admin/app");
    (cert as jest.Mock).mockReturnValue({ credential: "mock-cert" });
    (initializeApp as jest.Mock).mockReturnValue(mockApp);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("initializeFirebaseAdmin()", () => {
    it("should initialize Firebase Admin with all required env vars", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";
      process.env.FIREBASE_STORAGE_BUCKET = "test-bucket";

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      const result = initializeFirebaseAdmin();

      expect(result).toEqual({
        app: mockApp,
        db: mockDb,
        auth: mockAuth,
        storage: mockStorage,
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "🔧 Initializing Firebase Admin with bucket:",
        "test-bucket"
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "✅ Firebase Admin SDK initialized"
      );
      expect(mockDb.settings).toHaveBeenCalledWith({
        ignoreUndefinedProperties: true,
      });

      consoleLogSpy.mockRestore();
    });

    it("should use default storage bucket if not provided", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";
      delete process.env.FIREBASE_STORAGE_BUCKET;

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      initializeFirebaseAdmin();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "🔧 Initializing Firebase Admin with bucket:",
        "test-project.appspot.com"
      );

      consoleLogSpy.mockRestore();
    });

    it("should handle private key with \\n characters", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "line1\\nline2\\nline3";

      const { cert } = require("firebase-admin/app");

      initializeFirebaseAdmin();

      expect(cert).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey: "line1\nline2\nline3",
        })
      );
    });

    it("should log when using Firestore emulator", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";
      process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      initializeFirebaseAdmin();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "🔥 Using Firestore emulator:",
        "localhost:8080"
      );

      consoleLogSpy.mockRestore();
    });

    it("should throw error when PROJECT_ID is missing", () => {
      delete process.env.FIREBASE_PROJECT_ID;
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      expect(() => initializeFirebaseAdmin()).toThrow(
        "Firebase Admin not configured"
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠ Firebase Admin missing required env vars. Skipping init."
      );

      consoleWarnSpy.mockRestore();
    });

    it("should throw error when CLIENT_EMAIL is missing", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      delete process.env.FIREBASE_CLIENT_EMAIL;
      process.env.FIREBASE_PRIVATE_KEY = "test-key";

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      expect(() => initializeFirebaseAdmin()).toThrow(
        "Firebase Admin not configured"
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠ Firebase Admin missing required env vars. Skipping init."
      );

      consoleWarnSpy.mockRestore();
    });

    it("should throw error when PRIVATE_KEY is missing", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      delete process.env.FIREBASE_PRIVATE_KEY;

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      expect(() => initializeFirebaseAdmin()).toThrow(
        "Firebase Admin not configured"
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠ Firebase Admin missing required env vars. Skipping init."
      );

      consoleWarnSpy.mockRestore();
    });

    it("should return existing app if already initialized", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";

      // Second call - app already exists (getApps returns array with app)
      mockGetApps.mockReturnValueOnce([mockApp as any]);

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      const result = initializeFirebaseAdmin();

      // Result should have the services (even if app is from module state)
      expect(result.db).toBe(mockDb);
      expect(result.auth).toBe(mockAuth);
      expect(result.storage).toBe(mockStorage);
      // Should not log initialization messages again
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        "✅ Firebase Admin SDK initialized"
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe("getFirestoreAdmin()", () => {
    it("should return existing Firestore instance", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";

      // Initialize first
      initializeFirebaseAdmin();

      const result = getFirestoreAdmin();

      expect(result).toBe(mockDb);
    });

    it("should initialize and return Firestore if not initialized", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";

      mockGetApps.mockReturnValueOnce([]);

      const result = getFirestoreAdmin();

      expect(result).toBe(mockDb);
    });
  });

  describe("getAuthAdmin()", () => {
    it("should return existing Auth instance", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";

      // Initialize first
      initializeFirebaseAdmin();

      const result = getAuthAdmin();

      expect(result).toBe(mockAuth);
    });

    it("should initialize and return Auth if not initialized", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";

      mockGetApps.mockReturnValueOnce([]);

      const result = getAuthAdmin();

      expect(result).toBe(mockAuth);
    });
  });

  describe("getStorageAdmin()", () => {
    it("should return existing Storage instance", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";

      // Initialize first
      initializeFirebaseAdmin();

      const result = getStorageAdmin();

      expect(result).toBe(mockStorage);
    });

    it("should initialize and return Storage if not initialized", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";

      mockGetApps.mockReturnValueOnce([]);

      const result = getStorageAdmin();

      expect(result).toBe(mockStorage);
    });
  });

  describe("verifyFirebaseAdmin()", () => {
    it("should return true when all env vars are set", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";
      process.env.FIREBASE_STORAGE_BUCKET = "test-bucket";

      const result = verifyFirebaseAdmin();

      expect(result).toBe(true);
    });

    it("should return false and log when PROJECT_ID is missing", () => {
      delete process.env.FIREBASE_PROJECT_ID;
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";
      process.env.FIREBASE_STORAGE_BUCKET = "test-bucket";

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Missing Firebase Admin environment variables:",
        ["FIREBASE_PROJECT_ID"]
      );

      consoleErrorSpy.mockRestore();
    });

    it("should return false and log when CLIENT_EMAIL is missing", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      delete process.env.FIREBASE_CLIENT_EMAIL;
      process.env.FIREBASE_PRIVATE_KEY = "test-key";
      process.env.FIREBASE_STORAGE_BUCKET = "test-bucket";

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Missing Firebase Admin environment variables:",
        ["FIREBASE_CLIENT_EMAIL"]
      );

      consoleErrorSpy.mockRestore();
    });

    it("should return false and log when PRIVATE_KEY is missing", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      delete process.env.FIREBASE_PRIVATE_KEY;
      process.env.FIREBASE_STORAGE_BUCKET = "test-bucket";

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Missing Firebase Admin environment variables:",
        ["FIREBASE_PRIVATE_KEY"]
      );

      consoleErrorSpy.mockRestore();
    });

    it("should return false and log when STORAGE_BUCKET is missing", () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
      process.env.FIREBASE_PRIVATE_KEY = "test-key";
      delete process.env.FIREBASE_STORAGE_BUCKET;

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Missing Firebase Admin environment variables:",
        ["FIREBASE_STORAGE_BUCKET"]
      );

      consoleErrorSpy.mockRestore();
    });

    it("should return false and log multiple missing env vars", () => {
      delete process.env.FIREBASE_PROJECT_ID;
      delete process.env.FIREBASE_CLIENT_EMAIL;
      process.env.FIREBASE_PRIVATE_KEY = "test-key";
      process.env.FIREBASE_STORAGE_BUCKET = "test-bucket";

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Missing Firebase Admin environment variables:",
        ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL"]
      );

      consoleErrorSpy.mockRestore();
    });

    it("should handle exceptions gracefully", () => {
      // Force an error by making env vars access throw
      Object.defineProperty(process, "env", {
        get: () => {
          throw new Error("Test error");
        },
      });

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const result = verifyFirebaseAdmin();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Error verifying Firebase Admin configuration:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();

      // Restore original env
      Object.defineProperty(process, "env", {
        value: originalEnv,
        writable: true,
      });
    });
  });
});
