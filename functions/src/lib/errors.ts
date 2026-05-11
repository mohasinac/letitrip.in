/**
 * Error Classes — Firebase Functions
 *
 * Mirrors the hierarchy in `src/lib/errors/` so functions follow RULE 14
 * (never throw raw `new Error()`). Kept local to the functions package to
 * avoid importing Next.js-coupled code from the main app.
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------
export class FnError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

// ---------------------------------------------------------------------------
// Subtypes
// ---------------------------------------------------------------------------

/** A required external configuration value (env var, secret) is missing. */
export class ConfigurationError extends FnError {
  constructor(message: string, data?: unknown) {
    super("CONFIGURATION_ERROR", message, data);
  }
}

/** The entity being operated on does not exist in Firestore. */
export class NotFoundError extends FnError {
  constructor(message: string, data?: unknown) {
    super("NOT_FOUND", message, data);
  }
}

/** An external integration call (Razorpay, Resend, etc.) returned a non-2xx. */
export class IntegrationError extends FnError {
  constructor(
    public readonly service: string,
    public readonly statusCode: number,
    message: string,
    data?: unknown,
  ) {
    super("INTEGRATION_ERROR", message, data);
  }
}

/** A Firestore read or write operation failed. */
export class DatabaseError extends FnError {
  constructor(message: string, data?: unknown) {
    super("DATABASE_ERROR", message, data);
  }
}

/** The incoming data or document shape is invalid. */
export class ValidationError extends FnError {
  constructor(message: string, data?: unknown) {
    super("VALIDATION_ERROR", message, data);
  }
}
