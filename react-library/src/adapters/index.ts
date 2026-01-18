/**
 * Adapter exports
 *
 * @module adapters
 */

// Types
export type {
  AnalyticsAdapter,
  AuthAdapter,
  CacheAdapter,
  DatabaseAdapter,
  HttpClient,
  StorageAdapter,
  UploadService,
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
