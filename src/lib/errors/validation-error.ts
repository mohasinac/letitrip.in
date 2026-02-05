/**
 * Validation Error Class
 *
 * Error class for input validation failures
 *
 * @example
 * ```ts
 * throw new ValidationError('Invalid input', { email: 'Invalid email format' });
 * ```
 */

import { AppError } from "./base-error";

export class ValidationError extends AppError {
  constructor(
    message: string,
    fields?: Record<string, string> | Record<string, string[]>,
  ) {
    super(400, message, "VALIDATION_ERROR", fields);
  }
}
