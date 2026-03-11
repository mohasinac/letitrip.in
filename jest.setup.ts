import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// ============================================
// Global Polyfills for Test Environment
// ============================================

// Add TextEncoder and TextDecoder to global scope
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder as any;
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder as any;
}

// ============================================
// Firebase Auth Polyfills for Test Environment
// ============================================

// Mock Response class
if (typeof global.Response === "undefined") {
  global.Response = class Response {
    ok: boolean;
    status: number;
    statusText: string;
    headers: any;
    body: any;

    constructor(body?: any, init?: any) {
      this.ok = init?.status ? init.status >= 200 && init.status < 300 : true;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || "OK";
      this.headers = init?.headers || {};
      this.body = body;
    }

    async json() {
      return typeof this.body === "string"
        ? JSON.parse(this.body)
        : this.body || {};
    }

    async text() {
      return typeof this.body === "string"
        ? this.body
        : JSON.stringify(this.body || "");
    }

    async arrayBuffer() {
      return new ArrayBuffer(0);
    }

    async blob() {
      return new Blob();
    }
  } as any;
}

// Mock Headers class
if (typeof global.Headers === "undefined") {
  global.Headers = class Headers {
    private headers: Map<string, string>;

    constructor(init?: any) {
      this.headers = new Map();
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), String(value));
        });
      }
    }

    get(name: string) {
      return this.headers.get(name.toLowerCase()) || null;
    }

    set(name: string, value: string) {
      this.headers.set(name.toLowerCase(), value);
    }

    has(name: string) {
      return this.headers.has(name.toLowerCase());
    }

    delete(name: string) {
      this.headers.delete(name.toLowerCase());
    }

    forEach(callback: (value: string, key: string) => void) {
      this.headers.forEach((value, key) => callback(value, key));
    }
  } as any;
}

// Mock fetch for Firebase Auth
if (typeof global.fetch === "undefined") {
  global.fetch = jest.fn((url: string, options?: any) =>
    Promise.resolve(
      new global.Response(
        JSON.stringify({
          idToken: "mock-id-token",
          refreshToken: "mock-refresh-token",
          expiresIn: "3600",
          localId: "mock-user-id",
        }),
        {
          status: 200,
          statusText: "OK",
          headers: { "content-type": "application/json" },
        },
      ),
    ),
  ) as any;
}

// ============================================
// Firebase Module Mocks
// ============================================

// Mock Firebase App
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({
    name: "[DEFAULT]",
    options: {},
  })),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({
    name: "[DEFAULT]",
    options: {},
  })),
}));

// Mock Firebase Config
jest.mock("@/lib/firebase/config", () => ({
  app: {
    name: "[DEFAULT]",
    options: {},
  },
  db: {},
  auth: {},
  storage: {},
  realtimeDb: {},
}));

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(() => Promise.resolve()),
  })),
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: {
        uid: "mock-user-id",
        email: "test@example.com",
        emailVerified: true,
        displayName: "Test User",
      },
    }),
  ),
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: {
        uid: "mock-user-id",
        email: "test@example.com",
        emailVerified: false,
        displayName: null,
      },
    }),
  ),
  signInWithPopup: jest.fn(() =>
    Promise.resolve({
      user: {
        uid: "mock-user-id",
        email: "test@example.com",
        emailVerified: true,
        displayName: "Test User",
      },
    }),
  ),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn(),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  sendEmailVerification: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
  updatePassword: jest.fn(() => Promise.resolve()),
  reauthenticateWithCredential: jest.fn(() => Promise.resolve()),
  GoogleAuthProvider: jest.fn(() => ({})),
  OAuthProvider: jest.fn(() => ({})),
}));

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

// Mock Firebase Storage
jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(() => Promise.resolve()),
  getDownloadURL: jest.fn(() =>
    Promise.resolve("https://example.com/mock-url"),
  ),
  deleteObject: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase Realtime Database
jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn(),
  set: jest.fn(() => Promise.resolve()),
  get: jest.fn(() => Promise.resolve({ exists: () => false, val: () => null })),
  onValue: jest.fn(),
  off: jest.fn(),
}));
// Mock Firebase Performance
jest.mock("firebase/performance", () => ({
  getPerformance: jest.fn(() => ({
    trace: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      incrementMetric: jest.fn(),
      putAttribute: jest.fn(),
    })),
  })),
}));

// Mock Firebase Analytics
jest.mock("firebase/analytics", () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(),
  setUserId: jest.fn(),
  setUserProperties: jest.fn(),
}));

// ============================================
// Next.js Router & Image Mocks
// ============================================

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt?: string } & Record<string, unknown>) => {
    const React = require("react");
    return React.createElement("img", { alt: alt || "", ...props });
  },
}));

// ============================================
// next-intl Mocks
// ============================================

// Resolve translation key from messages/en.json so existing assertions
// using UI_LABELS string values continue to pass after i18n wiring.
jest.mock("next-intl", () => {
  function _res(
    ns: string | undefined,
    key: string,
    params?: Record<string, unknown>,
  ): string {
    try {
      const msgs = require("./messages/en.json");
      const segs = [...(ns ? ns.split(".") : []), ...key.split(".")];
      let val: unknown = msgs;
      for (const seg of segs) {
        if (val && typeof val === "object")
          val = (val as Record<string, unknown>)[seg];
        else return key;
      }
      if (typeof val !== "string") return key;
      if (!params) return val;
      return Object.entries(params).reduce(
        (s, [k, v]) => s.replace(`{${k}}`, String(v)),
        val,
      );
    } catch {
      return key;
    }
  }
  const React = require("react");
  return {
    useLocale: () => "en",
    useTranslations:
      (ns?: string) => (key: string, params?: Record<string, unknown>) =>
        _res(ns, key, params),
    useMessages: () => {
      try {
        return require("./messages/en.json");
      } catch {
        return {};
      }
    },
    useTimeZone: () => "UTC",
    useNow: () => new Date(),
    NextIntlClientProvider: ({ children }: { children: unknown }) =>
      React.createElement(React.Fragment, null, children),
  };
});

// Mock next-intl/server (used by server components with getTranslations)
jest.mock("next-intl/server", () => {
  function _res(
    ns: string | undefined,
    key: string,
    params?: Record<string, unknown>,
  ): string {
    try {
      const msgs = require("./messages/en.json");
      const segs = [...(ns ? ns.split(".") : []), ...key.split(".")];
      let val: unknown = msgs;
      for (const seg of segs) {
        if (val && typeof val === "object")
          val = (val as Record<string, unknown>)[seg];
        else return key;
      }
      if (typeof val !== "string") return key;
      if (!params) return val;
      return Object.entries(params).reduce(
        (s, [k, v]) => s.replace(`{${k}}`, String(v)),
        val,
      );
    } catch {
      return key;
    }
  }
  return {
    getTranslations:
      async (ns?: string) => (key: string, params?: Record<string, unknown>) =>
        _res(ns, key, params),
    getMessages: async () => {
      try {
        return require("./messages/en.json");
      } catch {
        return {};
      }
    },
    getLocale: async () => "en",
    getTimeZone: async () => "UTC",
  };
});

// Mock Resend so that new Resend(undefined) does not throw when
// RESEND_API_KEY is absent in CI / test environments.
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest
        .fn()
        .mockResolvedValue({ data: { id: "mock-email-id" }, error: null }),
    },
  })),
}));

// Mock locale-aware navigation (mirrors next/navigation shape)
jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  Link: ({
    children,
    href,
    ...props
  }: { children?: unknown; href: string } & Record<string, unknown>) => {
    const React = require("react");
    return React.createElement("a", { href, ...props }, children);
  },
  redirect: jest.fn(),
  getPathname: jest.fn(() => "/"),
}));
