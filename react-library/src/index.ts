// Main entry point for @letitrip/react-library
// This file exports all utilities, components, hooks, types, and adapters

// Components first
export * from "./components";

// Hooks
export * from "./hooks";

// Styles
export * from "./styles";

// Utilities (includes HttpClient)
export * from "./utils";

// Adapters - export explicitly to avoid conflicts
export {
  // Upload service classes
  ApiUploadService,
  // Firebase adapters
  FirebaseAuthAdapter,
  FirebaseFirestoreAdapter,
  FirebaseStorageAdapter,
  // Example adapters
  InMemoryCacheAdapter,
  LocalStorageCacheAdapter,
  MockUploadService,
  StorageUploadService,
  SupabaseStorageAdapter,
  // Adapter interfaces
  type AnalyticsAdapter,
  type AuthAdapter,
  type CacheAdapter,
  type DatabaseAdapter,
  type StorageAdapter,
  type UploadService,
} from "./adapters";

// Types - import from './types' subpath to avoid conflicts
