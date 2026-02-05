/**
 * Authorization Error Class
 * 
 * Error class for authorization/permission failures
 * 
 * @example
 * ```ts
 * throw new AuthorizationError('Insufficient permissions');
 * ```
 */

import { AppError } from './base-error';

export class AuthorizationError extends AppError {
  constructor(message: string, data?: unknown) {
    super(403, message, 'AUTHORIZATION_ERROR', data);
  }
}
