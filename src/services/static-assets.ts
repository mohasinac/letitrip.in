/**
 * Static Assets Management System
 * Firebase Storage + CDN integration for managing static files
 */

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { app } from "@/app/api/lib/firebase/app";

const storage = getStorage(app);
const db = getFirestore(app);

export interface StaticAsset {
  id: string;
  name: string;
  type: "payment-logo" | "icon" | "image" | "document";
  url: string;
  storagePath: string;
  category?: string;
  uploadedBy: string;
  uploadedAt: string;
  size: number;
  contentType: string;
  metadata?: Record<string, any>;
}

export interface AssetUploadOptions {
  name: string;
  file: File;
  type: StaticAsset["type"];
  category?: string;
  userId: string;
  metadata?: Record<string, any>;
}

/**
 * Upload a static asset to Firebase Storage
 */
export async function uploadStaticAsset(
  options: AssetUploadOptions,
): Promise<StaticAsset> {
  const { name, file, type, category, userId, metadata } = options;

  // Generate storage path based on type
  const timestamp = Date.now();
  const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const storagePath = `static-assets/${type}/${category || "default"}/${timestamp}-${sanitizedName}`;

  // Upload to Firebase Storage
  const storageRef = ref(storage, storagePath);
  const customMetadata: Record<string, string> = {};
  if (metadata) {
    Object.keys(metadata).forEach((key) => {
      customMetadata[key] = String(metadata[key]);
    });
  }

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata:
      Object.keys(customMetadata).length > 0 ? customMetadata : undefined,
  });

  // Get download URL
  const url = await getDownloadURL(storageRef);

  // Save metadata to Firestore
  const asset: StaticAsset = {
    id: `${timestamp}-${sanitizedName}`,
    name,
    type,
    url,
    storagePath,
    category,
    uploadedBy: userId,
    uploadedAt: new Date().toISOString(),
    size: file.size,
    contentType: file.type,
    metadata,
  };

  await setDoc(doc(db, "static_assets", asset.id), asset);

  return asset;
}

/**
 * Get all static assets by type
 */
export async function getStaticAssetsByType(
  type: StaticAsset["type"],
): Promise<StaticAsset[]> {
  const q = query(collection(db, "static_assets"), where("type", "==", type));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as StaticAsset);
}

/**
 * Get all static assets by category
 */
export async function getStaticAssetsByCategory(
  category: string,
): Promise<StaticAsset[]> {
  const q = query(
    collection(db, "static_assets"),
    where("category", "==", category),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as StaticAsset);
}

/**
 * Get a single static asset
 */
export async function getStaticAsset(id: string): Promise<StaticAsset | null> {
  const docRef = doc(db, "static_assets", id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as StaticAsset) : null;
}

/**
 * Update static asset metadata
 */
export async function updateStaticAsset(
  id: string,
  updates: Partial<StaticAsset>,
): Promise<void> {
  const docRef = doc(db, "static_assets", id);
  await updateDoc(docRef, updates as any);
}

/**
 * Delete a static asset
 */
export async function deleteStaticAsset(id: string): Promise<void> {
  const asset = await getStaticAsset(id);
  if (!asset) {
    throw new Error("Asset not found");
  }

  // Delete from Storage
  const storageRef = ref(storage, asset.storagePath);
  await deleteObject(storageRef);

  // Delete from Firestore
  await deleteDoc(doc(db, "static_assets", id));
}

/**
 * Get all payment logos
 */
export async function getPaymentLogos(): Promise<StaticAsset[]> {
  return getStaticAssetsByType("payment-logo");
}

/**
 * Upload payment logo
 */
export async function uploadPaymentLogo(
  name: string,
  file: File,
  userId: string,
  paymentId: string,
): Promise<StaticAsset> {
  return uploadStaticAsset({
    name,
    file,
    type: "payment-logo",
    category: "payment-methods",
    userId,
    metadata: { paymentId },
  });
}

/**
 * Get payment logo URL by payment ID
 */
export async function getPaymentLogoUrl(
  paymentId: string,
): Promise<string | null> {
  const logos = await getPaymentLogos();
  const logo = logos.find((l) => l.metadata?.paymentId === paymentId);
  return logo ? logo.url : null;
}

/**
 * Bulk upload assets
 */
export async function bulkUploadAssets(
  files: File[],
  type: StaticAsset["type"],
  category: string,
  userId: string,
): Promise<StaticAsset[]> {
  const uploadPromises = files.map((file) =>
    uploadStaticAsset({
      name: file.name,
      file,
      type,
      category,
      userId,
    }),
  );

  return Promise.all(uploadPromises);
}

/**
 * Get asset CDN URL (Firebase Storage URL is already CDN-backed)
 */
export function getAssetCDNUrl(asset: StaticAsset): string {
  return asset.url;
}

/**
 * Migrate existing public assets to Firebase Storage
 */
export async function migratePublicAssets(userId: string): Promise<void> {
  // This would be run once to migrate existing assets
  // Implementation depends on how you want to handle existing files
  console.log("Migration would happen here");
}

export default {
  uploadStaticAsset,
  getStaticAssetsByType,
  getStaticAssetsByCategory,
  getStaticAsset,
  updateStaticAsset,
  deleteStaticAsset,
  getPaymentLogos,
  uploadPaymentLogo,
  getPaymentLogoUrl,
  bulkUploadAssets,
  getAssetCDNUrl,
};
