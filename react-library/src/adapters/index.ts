/**
 * Adapter exports
 *
 * @module adapters
 */

// Types
export type {
  AuthAdapter,
  DatabaseAdapter,
  StorageAdapter,
  UploadService,
  AnalyticsAdapter,
  CacheAdapter,
  HttpClient,
} from "../types/adapters";

// Classes
export { ApiUploadService, StorageUploadService } from "../types/adapters";

// Firebase adapters
export {
  FirebaseAuthAdapter,
  FirebaseFirestoreAdapter,
  FirebaseStorageAdapter,
} from "./firebase";

// Example adapters
export {
  InMemoryCacheAdapter,
  LocalStorageCacheAdapter,
  MockUploadService,
  SupabaseStorageAdapter,
} from "./examples";
