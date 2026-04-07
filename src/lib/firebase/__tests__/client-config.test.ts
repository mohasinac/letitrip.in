import {
  buildFirebaseClientConfig,
  normalizeFirebaseConfigValue,
} from "../client-config";

describe("normalizeFirebaseConfigValue", () => {
  it("trims whitespace and wrapping quotes", () => {
    expect(normalizeFirebaseConfigValue('  "value-with-crlf\\r\\n"  ')).toBe(
      "value-with-crlf\\r\\n",
    );
    expect(normalizeFirebaseConfigValue("  letitrip-in-app\r\n ")).toBe(
      "letitrip-in-app",
    );
  });

  it("returns undefined for empty values", () => {
    expect(normalizeFirebaseConfigValue("   ")).toBeUndefined();
    expect(normalizeFirebaseConfigValue(undefined)).toBeUndefined();
  });
});

describe("buildFirebaseClientConfig", () => {
  it("normalizes all public firebase env values", () => {
    const config = buildFirebaseClientConfig({
      NEXT_PUBLIC_FIREBASE_API_KEY: ' "api-key" ',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: " letitrip-in-app.firebaseapp.com\r\n",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: " letitrip-in-app\r\n",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
        ' "letitrip-in-app.firebasestorage.app" ',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: " 949266230223 ",
      NEXT_PUBLIC_FIREBASE_APP_ID: ' "1:949:web:abc" ',
      NEXT_PUBLIC_FIREBASE_DATABASE_URL:
        " https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app\r\n",
    } as NodeJS.ProcessEnv);

    expect(config).toEqual({
      apiKey: "api-key",
      authDomain: "letitrip-in-app.firebaseapp.com",
      projectId: "letitrip-in-app",
      storageBucket: "letitrip-in-app.firebasestorage.app",
      messagingSenderId: "949266230223",
      appId: "1:949:web:abc",
      databaseURL:
        "https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app",
    });
  });
});
