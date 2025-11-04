/**
 * Backend Model Types
 */

import { EntityId, Timestamps } from "../shared/common";

/**
 * Base model interface
 */
export interface BaseModel extends Timestamps {
  id: EntityId;
}

/**
 * Model with soft delete
 */
export interface SoftDeleteModel extends BaseModel {
  deletedAt?: string | Date | null;
}

/**
 * Model with audit fields
 */
export interface AuditModel extends BaseModel {
  createdBy?: EntityId;
  updatedBy?: EntityId;
}

/**
 * Firebase document data
 */
export interface FirebaseDocument {
  id: string;
  ref: any; // FirebaseFirestore.DocumentReference
  exists: boolean;
  data: () => any;
}

/**
 * Firebase query snapshot
 */
export interface FirebaseQuerySnapshot {
  empty: boolean;
  size: number;
  docs: FirebaseDocument[];
}

/**
 * Database transaction
 */
export interface Transaction {
  get: (ref: any) => Promise<any>;
  set: (ref: any, data: any) => void;
  update: (ref: any, data: any) => void;
  delete: (ref: any) => void;
}

/**
 * Batch write
 */
export interface BatchWrite {
  set: (ref: any, data: any) => void;
  update: (ref: any, data: any) => void;
  delete: (ref: any) => void;
  commit: () => Promise<void>;
}

/**
 * Upload result
 */
export interface UploadResult {
  url: string;
  path: string;
  filename: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, any>;
}

/**
 * File metadata
 */
export interface FileMetadata {
  name: string;
  size: number;
  contentType: string;
  bucket: string;
  fullPath: string;
  generation: string;
  metageneration: string;
  timeCreated: string;
  updated: string;
  md5Hash?: string;
  customMetadata?: Record<string, string>;
}
