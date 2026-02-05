/**
 * Authentication Error Class
 * 
 * Error class for authentication failures (login, token, etc.)
 * 
 * @example
 * ```ts
 * throw new AuthenticationError('Invalid credentials');
 * ```
 */

import { AppError } from './base-error';

export class AuthenticationError extends AppError {
  constructor(message: string, data?: unknown) {
    super(401, message, 'AUTHENTICATION_ERROR', data);
  }
}
