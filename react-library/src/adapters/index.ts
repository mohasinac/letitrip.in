/**
 * Adapter exports
 *
 * @module adapters
 */

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
