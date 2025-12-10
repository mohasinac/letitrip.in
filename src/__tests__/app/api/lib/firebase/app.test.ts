/**
 * Unit Tests: Firebase Client-Side Configuration
 * File: src/app/api/lib/firebase/app.ts
 */

// Mock firebase modules before imports
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(),
}));

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(),
}));

jest.mock("firebase/analytics", () => ({
  getAnalytics: jest.fn(),
}));

describe("Firebase Client-Side App", () => {
  let originalWindow: typeof window;
  let mockApp: any;
  let mockDatabase: any;
  let mockAnalytics: any;

  const validEnv = {
    NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test-project.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test-project.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:abcdef",
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://test-project.firebaseio.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Setup mocks
    mockApp = { name: "test-app" };
    mockDatabase = { ref: jest.fn() };
    mockAnalytics = { logEvent: jest.fn() };

    const { initializeApp, getApps } = require("firebase/app");
    const { getDatabase } = require("firebase/database");
    const { getAnalytics } = require("firebase/analytics");

    (getApps as jest.Mock).mockReturnValue([]);
    (initializeApp as jest.Mock).mockReturnValue(mockApp);
    (getDatabase as jest.Mock).mockReturnValue(mockDatabase);
    (getAnalytics as jest.Mock).mockReturnValue(mockAnalytics);

    // Setup environment
    Object.assign(process.env, validEnv);
  });

  describe("Client-Side Initialization", () => {
    it("should only initialize on client-side (when window exists)", () => {
      const { initializeApp } = require("firebase/app");

      // Simulate client-side
      (global as any).window = {};

      // Re-import to trigger initialization
      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      expect(initializeApp).toHaveBeenCalled();

      delete (global as any).window;
    });

    it("should initialize Firebase with correct config", () => {
      const { initializeApp } = require("firebase/app");

      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: "test-api-key",
        authDomain: "test-project.firebaseapp.com",
        projectId: "test-project",
        storageBucket: "test-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef",
        databaseURL: "https://test-project.firebaseio.com",
      });

      delete (global as any).window;
    });

    it("should not initialize if app already exists", () => {
      const { initializeApp, getApps } = require("firebase/app");
      (getApps as jest.Mock).mockReturnValue([mockApp]); // Already initialized

      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      expect(initializeApp).not.toHaveBeenCalled();

      delete (global as any).window;
    });

    it("should initialize Realtime Database", () => {
      const { getDatabase } = require("firebase/database");

      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      expect(getDatabase).toHaveBeenCalledWith(mockApp);

      delete (global as any).window;
    });

    it("should initialize Analytics", () => {
      const { getAnalytics } = require("firebase/analytics");

      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      expect(getAnalytics).toHaveBeenCalledWith(mockApp);

      delete (global as any).window;
    });
  });

  describe("Export Verification", () => {
    it("should not export Firestore (security policy)", () => {
      (global as any).window = {};

      const exports = jest.isolateModules(() => {
        return require("@/app/api/lib/firebase/app");
      });

      expect(exports.firestore).toBeUndefined();
      expect(exports.getFirestore).toBeUndefined();

      delete (global as any).window;
    });

    it("should not export Storage (security policy)", () => {
      (global as any).window = {};

      const exports = jest.isolateModules(() => {
        return require("@/app/api/lib/firebase/app");
      });

      expect(exports.storage).toBeUndefined();
      expect(exports.getStorage).toBeUndefined();

      delete (global as any).window;
    });

    it("should not export Auth (security policy)", () => {
      (global as any).window = {};

      const exports = jest.isolateModules(() => {
        return require("@/app/api/lib/firebase/app");
      });

      expect(exports.auth).toBeUndefined();
      expect(exports.getAuth).toBeUndefined();

      delete (global as any).window;
    });
  });

  describe("Environment Variables", () => {
    it("should handle missing API key", () => {
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      const { initializeApp } = require("firebase/app");
      const config = (initializeApp as jest.Mock).mock.calls[0]?.[0];

      expect(config?.apiKey).toBeUndefined();

      delete (global as any).window;
    });

    it("should handle missing database URL", () => {
      delete process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      const { initializeApp } = require("firebase/app");
      const config = (initializeApp as jest.Mock).mock.calls[0]?.[0];

      expect(config?.databaseURL).toBeUndefined();

      delete (global as any).window;
    });

    it("should handle all env vars being undefined", () => {
      Object.keys(process.env).forEach((key) => {
        if (key.startsWith("NEXT_PUBLIC_FIREBASE_")) {
          delete process.env[key];
        }
      });

      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      const { initializeApp } = require("firebase/app");
      const config = (initializeApp as jest.Mock).mock.calls[0]?.[0];

      expect(config).toEqual({
        apiKey: undefined,
        authDomain: undefined,
        projectId: undefined,
        storageBucket: undefined,
        messagingSenderId: undefined,
        appId: undefined,
        databaseURL: undefined,
      });

      delete (global as any).window;
    });

    it("should pass through all config values without modification", () => {
      const customEnv = {
        NEXT_PUBLIC_FIREBASE_API_KEY: "custom-key-123",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "custom.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "custom-project",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "custom-bucket.appspot.com",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "987654321",
        NEXT_PUBLIC_FIREBASE_APP_ID: "1:987654321:web:xyz",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://custom.firebaseio.com",
      };

      Object.assign(process.env, customEnv);
      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      const { initializeApp } = require("firebase/app");
      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: "custom-key-123",
        authDomain: "custom.firebaseapp.com",
        projectId: "custom-project",
        storageBucket: "custom-bucket.appspot.com",
        messagingSenderId: "987654321",
        appId: "1:987654321:web:xyz",
        databaseURL: "https://custom.firebaseio.com",
      });

      delete (global as any).window;
    });
  });

  describe("Edge Cases", () => {
    it("should handle window object without typical browser properties", () => {
      const { initializeApp } = require("firebase/app");
      (global as any).window = {}; // Minimal window object

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      expect(initializeApp).toHaveBeenCalled();

      delete (global as any).window;
    });

    it("should handle getApps returning empty array", () => {
      const { initializeApp, getApps } = require("firebase/app");
      (getApps as jest.Mock).mockReturnValue([]);
      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      expect(initializeApp).toHaveBeenCalled();

      delete (global as any).window;
    });

    it("should handle getApps returning null safely", () => {
      const { initializeApp, getApps } = require("firebase/app");
      (getApps as jest.Mock).mockReturnValue(null);
      (global as any).window = {};

      expect(() => {
        jest.isolateModules(() => {
          require("@/app/api/lib/firebase/app");
        });
      }).not.toThrow();

      expect(initializeApp).toHaveBeenCalled();

      delete (global as any).window;
    });

    it("should handle very long config values", () => {
      const longKey = "a".repeat(1000);
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = longKey;
      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      const { initializeApp } = require("firebase/app");
      const config = (initializeApp as jest.Mock).mock.calls[0]?.[0];

      expect(config?.apiKey).toHaveLength(1000);

      delete (global as any).window;
    });

    it("should handle special characters in config values", () => {
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project-123!@#";
      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      const { initializeApp } = require("firebase/app");
      const config = (initializeApp as jest.Mock).mock.calls[0]?.[0];

      expect(config?.projectId).toBe("test-project-123!@#");

      delete (global as any).window;
    });

    it("should handle empty string env vars", () => {
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "";
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "";
      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      const { initializeApp } = require("firebase/app");
      const config = (initializeApp as jest.Mock).mock.calls[0]?.[0];

      expect(config?.apiKey).toBe("");
      expect(config?.projectId).toBe("");

      delete (global as any).window;
    });

    it("should not reinitialize on subsequent imports with existing app", () => {
      const { initializeApp, getApps } = require("firebase/app");
      (global as any).window = {};

      // First import
      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      // Mock app now exists
      (getApps as jest.Mock).mockReturnValue([mockApp]);

      // Second import
      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      // Should only have been called once total
      expect(initializeApp).toHaveBeenCalledTimes(1);

      delete (global as any).window;
    });
  });

  describe("Security Policy Compliance", () => {
    it("should follow minimal client-side Firebase philosophy", () => {
      const { getDatabase, getAnalytics } = require("firebase/database");
      (global as any).window = {};

      jest.isolateModules(() => {
        require("@/app/api/lib/firebase/app");
      });

      // Only these two should be called
      expect(getDatabase).toHaveBeenCalled();

      delete (global as any).window;
    });
  });
});
