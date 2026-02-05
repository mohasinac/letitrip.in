/**
 * API Error Class
 * 
 * Error class for API-related errors (network, server, etc.)
 * 
 * @example
 * ```ts
 * throw new ApiError(500, 'Internal server error', { details: '...' });
 * ```
 */

import { AppError } from './base-error';

export class ApiError extends AppError {
  constructor(statusCode: number, message: string, data?: unknown) {
    super(statusCode, message, 'API_ERROR', data);
  }
}
