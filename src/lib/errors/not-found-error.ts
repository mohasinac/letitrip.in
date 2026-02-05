/**
 * Not Found Error Class
 * 
 * Error class for resource not found errors
 * 
 * @example
 * ```ts
 * throw new NotFoundError('User not found');
 * ```
 */

import { AppError } from './base-error';

export class NotFoundError extends AppError {
  constructor(message: string, data?: unknown) {
    super(404, message, 'NOT_FOUND', data);
  }
}
