/**
 * @fileoverview Service Module
 * @module src/app/api/lib/static-assets-server.service
 * @description This file contains service functions for static-assets-server operations
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Static Assets Server Service
 * Firebase Storage operations (server-side only)
 */

import { getStorage } from "firebase-admin/storage";
import { getFirestoreAdmin } from "./firebase/admin";

const COLLECTION = "static_assets";

/**
 * StaticAsset interface
 * 
 * @interface
 * @description Defines the structure and contract for StaticAsset
 */
export interface StaticAsset {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Type */
  type: "payment-logo" | "icon" | "image" | "video" | "document";
  /** Url */
  url: string;
  /** Storage Path */
  storagePath: string;
  /** Category */
  category?: string;
  /** Uploaded By */
  uploadedBy: string;
  /** Uploaded At */
  uploadedAt: string;
  /** Size */
  size: number;
  /** Content Type */
  contentType: string;
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Generate signed upload URL (server-side only)
 */
/**
 * Performs generate upload url operation
 *
 * @returns {Promise<any>} Promise resolving to generateuploadurl result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * generateUploadUrl();
 */

/**
 * Performs generate upload url operation
 *
 * @returns {Promise<any>} Promise resolving to generateuploadurl result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * generateUploadUrl();
 */

export async function generateUploadUrl(
  /** File Name */
  fileName: string,
  /** Content Type */
  contentType: string,
  /** Type */
  type: string,
  /** Category */
  category?: string,
): Promise<{ uploadUrl: string; assetId: string; storagePath: string }> {
  const storage = getStorage();
  const bucket = storage.bucket();

  // Generate unique storage path
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "-");
  const storagePath = `static-assets/${type}/${category || "default"}/${timestamp}-${sanitizedName}`;

  // Generate signed URL (valid for 15 minutes)
  const file = bucket.file(storagePath);
  const [uploadUrl] = await file.getSignedUrl({
    /** Version */
    version: "v4",
    /** Action */
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  const assetId = `${timestamp}-${sanitizedName}`;

  return {
    uploadUrl,
    assetId,
    storagePath,
  };
}

/**
 * Get public download URL for a file
 */
/**
 * Retrieves download url
 *
 * @param {string} storagePath - The storage path
 *
 * @returns {Promise<any>} Promise resolving to downloadurl result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getDownloadUrl("example");
 */

/**
 * Retrieves download url
 *
 * @param {string} storagePath - The storage path
 *
 * @returns {Promise<any>} Promise resolving to downloadurl result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getDownloadUrl("example");
 */

export async function getDownloadUrl(storagePath: string): Promise<string> {
  const storage = getStorage();
  const bucket = storage.bucket();
  const file = bucket.file(storagePath);

  // Make file publicly accessible
  await file.makePublic();

  // Get public URL
  return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
}

/**
 * Save asset metadata to Firestore
 */
/**
 * Saves asset metadata
 *
 * @param {StaticAsset} asset - The asset
 *
 * @returns {Promise<any>} Promise resolving to saveassetmetadata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * saveAssetMetadata(asset);
 */

/**
 * Saves asset metadata
 *
 * @param {StaticAsset} asset - The asset
 *
 * @returns {Promise<any>} Promise resolving to saveassetmetadata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * saveAssetMetadata(asset);
 */

export async function saveAssetMetadata(asset: StaticAsset): Promise<void> {
  const db = getFirestoreAdmin();
  await db.collection(COLLECTION).doc(asset.id).set(asset);
}

/**
 * Get asset metadata from Firestore
 */
/**
 * Retrieves asset metadata
 *
 * @param {string} id - Unique identifier
 *
 * @returns {Promise<any>} Promise resolving to assetmetadata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAssetMetadata("example");
 */

/**
 * Retrieves asset metadata
 *
 * @param {string} /** Id */
  id - The /**  id */
  id
 *
 * @returns {Promise<any>} Promise resolving to assetmetadata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAssetMetadata("example");
 */

export async function getAssetMetadata(
  /** Id */
  id: string,
): Promise<StaticAsset | null> {
  const db = getFirestoreAdmin();
  const doc = await db.collection(COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as StaticAsset) : null;
}

/**
 * List assets with filters
 */
/**
 * Performs list assets operation
 *
 * @param {{
  type?} [filters] - The filters
 *
 * @returns {Promise<any>} Promise resolving to listassets result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * listAssets({});
 */

/**
 * Performs list assets operation
 *
 * @returns {Promise<any>} Promise resolving to listassets result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * listAssets();
 */

export async function listAssets(filters?: {
  /** Type */
  type?: string;
  /** Category */
  category?: string;
}): Promise<StaticAsset[]> {
  const db = getFirestoreAdmin();
  let query = db.collection(COLLECTION);

  if (filters?.type) {
    query = query.where("type", "==", filters.type) as any;
  }

  if (filters?.category) {
    query = query.where("category", "==", filters.category) as any;
  }

  query = query.orderBy("uploadedAt", "desc") as any;

  const snapshot = await query.get();
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as StaticAsset,
  );
}

/**
 * Update asset metadata
 */
/**
 * Updates existing asset metadata
 *
 * @param {string} id - Unique identifier
 * @param {Partial<StaticAsset>} updates - The updates
 *
 * @returns {Promise<any>} Promise resolving to updateassetmetadata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * updateAssetMetadata("example", updates);
 */

/**
 * Updates existing asset metadata
 *
 * @returns {Promise<any>} Promise resolving to updateassetmetadata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * updateAssetMetadata();
 */

export async function updateAssetMetadata(
  /** Id */
  id: string,
  /** Updates */
  updates: Partial<StaticAsset>,
): Promise<void> {
  const db = getFirestoreAdmin();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({
      ...updates,
      /** Updated At */
      updatedAt: new Date().toISOString(),
    });
}

/**
 * Delete asset (both Storage and Firestore)
 */
/**
 * Deletes asset
 *
 * @param {string} id - Unique identifier
 *
 * @returns {Promise<any>} Promise resolving to deleteasset result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * deleteAsset("example");
 */

/**
 * Deletes asset
 *
 * @param {string} id - Unique identifier
 *
 * @returns {Promise<any>} Promise resolving to deleteasset result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * deleteAsset("example");
 */

export async function deleteAsset(id: string): Promise<void> {
  const db = getFirestoreAdmin();
  const storage = getStorage();
  const bucket = storage.bucket();

  // Get asset metadata
  const asset = await getAssetMetadata(id);
  if (!asset) {
    throw new Error("Asset not found");
  }

  // Delete from Storage
  try {
    await bucket.file(asset.storagePath).delete();
  } catch (error) {
    console.warn("Storage deletion failed:", error);
    // Continue with Firestore deletion
  }

  // Delete from Firestore
  await db.collection(COLLECTION).doc(id).delete();
}

export default {
  generateUploadUrl,
  getDownloadUrl,
  saveAssetMetadata,
  getAssetMetadata,
  listAssets,
  updateAssetMetadata,
  deleteAsset,
};
