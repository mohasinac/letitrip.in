/**
 * Base Error Class
 * 
 * Foundation for all application errors with status code and error code support.
 * All custom errors should extend this class.
 * 
 * @example
 * ```ts
 * throw new AppError(404, 'Resource not found', 'NOT_FOUND');
 * ```
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public data?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts error to JSON format for API responses
   */
  toJSON() {
    const result: {
      success: false;
      error: string;
      code: string;
      statusCode: number;
      data?: unknown;
    } = {
      success: false,
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };

    if (this.data) {
      result.data = this.data;
    }

    return result;
  }
}
