/**
 * Type-safe environment variables with runtime validation
 * 
 * This module validates all environment variables at startup using Zod schemas.
 * It provides type-safe access to environment variables throughout the application.
 * 
 * @module env
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Server-side environment variables
   * These are only available on the server and never exposed to the client
   */
  server: {
    // Node Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
    
    // Firebase Admin (Server-side only)
    FIREBASE_ADMIN_PROJECT_ID: z.string().min(1, 'Firebase Admin Project ID is required'),
    FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email('Invalid Firebase Admin Client Email'),
    FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1, 'Firebase Admin Private Key is required'),
    
    // Application Settings
    COUPON_CODE_PREFIX: z.string().default('LT'),
    COUPON_CODE_LENGTH: z.coerce.number().int().positive().default(8),
    MAX_FILE_SIZE: z.coerce.number().int().positive().default(10485760), // 10MB
    ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp'),
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
    
    // Firebase Indexes
    USE_COMPOSITE_INDEXES: z.coerce.boolean().default(false),
  },

  /**
   * Client-side environment variables
   * These are exposed to the browser and must be prefixed with NEXT_PUBLIC_
   */
  client: {
    // Site Configuration
    NEXT_PUBLIC_SITE_NAME: z.string().default('Letitrip'),
    NEXT_PUBLIC_DOMAIN: z.string().default('letitrip.in'),
    NEXT_PUBLIC_SITE_URL: z.string().url('Invalid site URL'),
    NEXT_PUBLIC_API_URL: z.string().url('Invalid API URL'),
    
    // Contact Information
    NEXT_PUBLIC_CONTACT_PHONE: z.string().regex(/^\+?[0-9-]+$/, 'Invalid phone number format'),
    NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().regex(/^\+?[0-9-]+$/, 'Invalid WhatsApp number format'),
    
    // Firebase Configuration (Client-side)
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key is required'),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase Auth Domain is required'),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase Storage Bucket is required'),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase Messaging Sender ID is required'),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase App ID is required'),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
    
    // Socket Configuration
    NEXT_PUBLIC_SOCKET_URL: z.string().url('Invalid Socket URL'),
    
    // Feature Flags
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean().default(true),
  },

  /**
   * Runtime environment variable values
   * These are used to populate the validated environment object
   */
  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,
    FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
    FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    COUPON_CODE_PREFIX: process.env.COUPON_CODE_PREFIX,
    COUPON_CODE_LENGTH: process.env.COUPON_CODE_LENGTH,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    USE_COMPOSITE_INDEXES: process.env.USE_COMPOSITE_INDEXES,
    
    // Client
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CONTACT_PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  },

  /**
   * Skip validation during build if not needed
   * Set to true to skip validation in CI/CD environments
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

/**
 * Helper functions for working with environment variables
 */

/**
 * Check if running in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in test mode
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Get allowed file types as an array
 */
export const getAllowedFileTypes = (): string[] => {
  return env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim());
};

/**
 * Get Firebase client configuration
 */
export const getFirebaseClientConfig = () => ({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
});

/**
 * Get Firebase Admin configuration
 */
export const getFirebaseAdminConfig = () => ({
  projectId: env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
});

/**
 * Get rate limit configuration
 */
export const getRateLimitConfig = () => ({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
});

/**
 * Type exports for use throughout the application
 */
export type Env = typeof env;
export type FirebaseClientConfig = ReturnType<typeof getFirebaseClientConfig>;
export type FirebaseAdminConfig = ReturnType<typeof getFirebaseAdminConfig>;
export type RateLimitConfig = ReturnType<typeof getRateLimitConfig>;
