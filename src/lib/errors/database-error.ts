/**
 * Database Error Class
 * 
 * Error class for database-related errors (connection, query, etc.)
 * 
 * @example
 * ```ts
 * throw new DatabaseError('Connection failed');
 * ```
 */

import { AppError } from './base-error';

export class DatabaseError extends AppError {
  constructor(message: string, data?: unknown) {
    super(500, message, 'DATABASE_ERROR', data);
  }
}
