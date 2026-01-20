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

// Adapter types only - interfaces are SSR-safe
// NOTE: Adapter classes (Firebase, LocalStorage, etc.) are NOT exported from main entry
// to avoid SSR issues. Import them directly from "@letitrip/react-library/adapters"
export type {
  AnalyticsAdapter,
  AuthAdapter,
  CacheAdapter,
  DatabaseAdapter,
  StorageAdapter,
  UploadService,
} from "./adapters";

// Types - import from './types' subpath to avoid conflicts
