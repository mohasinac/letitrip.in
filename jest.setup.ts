import "@testing-library/jest-dom";

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
