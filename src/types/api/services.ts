/**
 * Backend Service Types
 */

import { EntityId } from "../shared/common";

/**
 * Service result wrapper
 */
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Service options
 */
export interface ServiceOptions {
  useCache?: boolean;
  cacheTTL?: number;
  throwOnError?: boolean;
}

/**
 * Database query options
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: "asc" | "desc";
  include?: string[];
  where?: Record<string, any>;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  isolationLevel?: "READ_UNCOMMITTED" | "READ_COMMITTED" | "REPEATABLE_READ" | "SERIALIZABLE";
  timeout?: number;
}

/**
 * Batch operation options
 */
export interface BatchOptions {
  batchSize?: number;
  parallel?: boolean;
  stopOnError?: boolean;
}

/**
 * Email service options
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Storage service options
 */
export interface StorageOptions {
  bucket?: string;
  folder?: string;
  public?: boolean;
  metadata?: Record<string, any>;
  contentType?: string;
}

/**
 * Search service options
 */
export interface SearchOptions {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
  boost?: Record<string, number>;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}
