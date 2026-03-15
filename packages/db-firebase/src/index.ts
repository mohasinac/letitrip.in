/**
 * @mohasinac/db-firebase
 *
 * Firebase Firestore + Realtime DB implementation of the repository contracts.
 *
 * @example
 * ```ts
 * import { FirebaseRepository } from "@mohasinac/db-firebase";
 * import type { Product } from "@/types";
 *
 * export class ProductRepository extends FirebaseRepository<Product> {
 *   constructor() { super("products"); }
 * }
 * ```
 */

// Admin SDK singletons
export {
  getAdminApp,
  getAdminAuth,
  getAdminDb,
  getAdminStorage,
  getAdminRealtimeDb,
  _resetAdminSingletons,
} from "./admin.js";

// Serialisation helpers
export {
  removeUndefined,
  prepareForFirestore,
  deserializeTimestamps,
} from "./helpers.js";

// Repository base classes
export { FirebaseRepository } from "./base.js";
export { FirebaseSieveRepository } from "./sieve.js";
export { FirebaseRealtimeRepository } from "./realtime.js";

// Types re-exported for consumers
export type {
  SieveModel,
  SieveFields,
  SieveFieldConfig,
  SieveOptions,
  SieveResult,
} from "./sieve.js";
