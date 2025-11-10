/**
 * Static Assets Server Service
 * Firebase Storage operations (server-side only)
 */

import { getStorage } from "firebase-admin/storage";
import { getFirestoreAdmin } from "./firebase/admin";

const COLLECTION = "static_assets";

export interface StaticAsset {
  id: string;
  name: string;
  type: "payment-logo" | "icon" | "image" | "video" | "document";
  url: string;
  storagePath: string;
  category?: string;
  uploadedBy: string;
  uploadedAt: string;
  size: number;
  contentType: string;
  metadata?: Record<string, any>;
}

/**
 * Generate signed upload URL (server-side only)
 */
export async function generateUploadUrl(
  fileName: string,
  contentType: string,
  type: string,
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
    version: "v4",
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
export async function saveAssetMetadata(asset: StaticAsset): Promise<void> {
  const db = getFirestoreAdmin();
  await db.collection(COLLECTION).doc(asset.id).set(asset);
}

/**
 * Get asset metadata from Firestore
 */
export async function getAssetMetadata(
  id: string,
): Promise<StaticAsset | null> {
  const db = getFirestoreAdmin();
  const doc = await db.collection(COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as StaticAsset) : null;
}

/**
 * List assets with filters
 */
export async function listAssets(filters?: {
  type?: string;
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
export async function updateAssetMetadata(
  id: string,
  updates: Partial<StaticAsset>,
): Promise<void> {
  const db = getFirestoreAdmin();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
}

/**
 * Delete asset (both Storage and Firestore)
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
