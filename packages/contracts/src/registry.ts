import type { IAuthProvider, ISessionProvider } from "./auth.js";
import type { IEmailProvider } from "./email.js";
import type { IStorageProvider } from "./storage.js";
import type { IPaymentProvider } from "./payment.js";
import type { IShippingProvider } from "./shipping.js";
import type { ISearchProvider } from "./search.js";
import type { ICacheProvider, IQueueProvider, IEventBus } from "./infra.js";
import type { IStyleAdapter } from "./style.js";

// ─── Provider Registry ────────────────────────────────────────────────────────

/**
 * The single DI container. Populated once at app startup via registerProviders().
 * Feature packages access concrete implementations via getProviders() — they
 * never import a concrete provider directly (Dependency Inversion Principle).
 */
export interface ProviderRegistry {
  auth: IAuthProvider;
  session: ISessionProvider;
  email: IEmailProvider;
  storage: IStorageProvider;
  style: IStyleAdapter;
  /** Optional — only required for projects with payment flows */
  payment?: IPaymentProvider;
  /** Optional — only required for projects with order shipping */
  shipping?: IShippingProvider;
  /** Optional — only required for projects with full-text search */
  search?: ISearchProvider;
  /** Optional — falls back to in-memory cache if not provided */
  cache?: ICacheProvider;
  /** Optional — falls back to in-memory queue if not provided */
  queue?: IQueueProvider;
  /** Optional — falls back to EventEmitter if not provided */
  eventBus?: IEventBus;
}

let _registry: ProviderRegistry | null = null;

/**
 * Call once at app startup (e.g. in providers.config.ts).
 * Subsequent calls replace the registry — useful in tests.
 */
export function registerProviders(registry: ProviderRegistry): void {
  _registry = registry;
}

/**
 * Returns the registry. Throws if registerProviders() has not been called.
 * Feature packages call this to resolve concrete implementations.
 */
export function getProviders(): ProviderRegistry {
  if (!_registry) {
    throw new Error(
      "[contracts] Call registerProviders() before getProviders(). " +
        "Ensure providers.config.ts is imported at app startup.",
    );
  }
  return _registry;
}

/**
 * Resets the registry — only for use in test environments.
 * @internal
 */
export function _resetProviders(): void {
  _registry = null;
}
