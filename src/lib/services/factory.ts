/**
 * Service Factory - Centralized Service Creation
 * Creates and configures all services with proper adapters
 */

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { app } from "@/app/api/lib/firebase/app";
import {
  FirebaseFirestoreAdapter,
  FirebaseStorageAdapter,
  FirebaseAuthAdapter,
  StorageUploadService,
  ApiUploadService,
  type UploadService,
  type DatabaseAdapter,
  type StorageAdapter,
  type AuthAdapter,
} from "@letitrip/react-library";

// Firebase instances
const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Adapters
export const databaseAdapter: DatabaseAdapter = new FirebaseFirestoreAdapter(firestore);
export const storageAdapter: StorageAdapter = new FirebaseStorageAdapter(storage);
export const authAdapter: AuthAdapter = new FirebaseAuthAdapter(auth);

// Upload Services
export const apiUploadService: UploadService = new ApiUploadService("/api/media/upload");
export const storageUploadService: UploadService = new StorageUploadService(storageAdapter);

// Default upload service (use API route)
export const defaultUploadService = apiUploadService;

/**
 * Create a configured upload service for specific context
 */
export function createUploadService(
  type: "api" | "storage" = "api",
  options?: {
    apiEndpoint?: string;
    storagePath?: string;
  }
): UploadService {
  if (type === "api") {
    return new ApiUploadService(options?.apiEndpoint || "/api/media/upload");
  }

  return new StorageUploadService(storageAdapter, {
    basePath: options?.storagePath || "uploads",
  });
}

/**
 * Service configuration
 */
export const serviceConfig = {
  upload: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
    maxVideoDuration: 300, // 5 minutes
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedVideoTypes: ["video/mp4", "video/webm", "video/quicktime"],
  },
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    timeout: 30000, // 30 seconds
  },
  storage: {
    bucketURL: process.env.NEXT_PUBLIC_STORAGE_URL || "",
  },
} as const;

/**
 * Service registry for dependency injection
 */
export const services = {
  database: databaseAdapter,
  storage: storageAdapter,
  auth: authAdapter,
  upload: {
    api: apiUploadService,
    storage: storageUploadService,
    default: defaultUploadService,
  },
  config: serviceConfig,
} as const;

export type Services = typeof services;
