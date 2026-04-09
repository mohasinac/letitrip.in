/**
 * Thin shim — delegates to @mohasinac/db-firebase singletons.
 * No manual Firebase Admin init here; the package handles it once.
 */
import {
  getAdminDb as _getAdminDb,
  getAdminAuth as _getAdminAuth,
  getAdminApp as _getAdminApp,
  getAdminStorage as _getAdminStorage,
  getAdminRealtimeDb as _getAdminRealtimeDb,
} from "@mohasinac/appkit/providers/db-firebase";

export const getAdminApp = _getAdminApp;
export const getAdminAuth = _getAdminAuth;
export const getAdminDb = _getAdminDb;
/** Alias kept for back-compat — callers import as `getStorage` */
export const getStorage = _getAdminStorage;
export const getAdminRealtimeDb = _getAdminRealtimeDb;
