/**
 * Environment Configuration
 * Centralized environment variable management
 */

/**
 * Validate required environment variables
 */
function validateEnv(key: string, value: string | undefined): string {
  if (!value) {
    console.warn(`⚠️ Environment variable ${key} is not defined`);
    return "";
  }
  return value;
}

/**
 * Environment configuration
 */
export const env = {
  // App
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",

  // URLs
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "/api",

  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: validateEnv(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  ),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: validateEnv(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  ),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: validateEnv(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  ),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: validateEnv(
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  ),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  NEXT_PUBLIC_FIREBASE_APP_ID: validateEnv(
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",

  // Firebase Admin (Server-side only)
  FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "",
  FIREBASE_PROJECT_ID:
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "",
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : "",

  // Payment
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "http://localhost:3001"],

  // Rate Limiting
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "60000",
    10,
  ),

  // Feature Flags
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === "true",
  ENABLE_ERROR_TRACKING: process.env.ENABLE_ERROR_TRACKING === "true",
  ENABLE_MAINTENANCE_MODE: process.env.ENABLE_MAINTENANCE_MODE === "true",
} as const;

/**
 * Client-safe environment variables
 * Only includes NEXT_PUBLIC_ variables
 */
export const clientEnv = {
  APP_URL: env.NEXT_PUBLIC_APP_URL,
  SITE_URL: env.NEXT_PUBLIC_SITE_URL,
  API_URL: env.NEXT_PUBLIC_API_URL,
  FIREBASE_API_KEY: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  RAZORPAY_KEY_ID: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  ENABLE_ANALYTICS: env.ENABLE_ANALYTICS,
  IS_PRODUCTION: env.IS_PRODUCTION,
} as const;

/**
 * Check if all required environment variables are set
 */
export function checkRequiredEnvVars(): { valid: boolean; missing: string[] } {
  const required = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:", missing);
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Print environment configuration (safe for logging)
 */
export function printEnvConfig(): void {
  if (env.IS_DEVELOPMENT) {
    console.log("🔧 Environment Configuration:");
    console.log("- NODE_ENV:", env.NODE_ENV);
    console.log("- APP_URL:", env.NEXT_PUBLIC_APP_URL);
    console.log("- API_URL:", env.NEXT_PUBLIC_API_URL);
    console.log("- Firebase Project:", env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.log("- Analytics:", env.ENABLE_ANALYTICS ? "Enabled" : "Disabled");
  }
}
