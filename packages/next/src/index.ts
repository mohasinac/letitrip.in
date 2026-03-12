/**
 * @mohasinac/next — Next.js adapters and utilities
 *
 * Stage B4: IAuthVerifier interface + createApiErrorHandler factory.
 */

// Auth verifier interface (inject your Firebase / Auth.js implementation)
export type { IAuthVerifier, AuthVerifiedUser } from "./IAuthVerifier";

// Generic API error handler factory
export { createApiErrorHandler } from "./api/errorHandler";
export type {
  IApiErrorLogger,
  ApiErrorHandlerOptions,
} from "./api/errorHandler";
