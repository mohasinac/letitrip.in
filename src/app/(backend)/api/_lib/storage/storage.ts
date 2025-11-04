import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/app/(backend)/api/_lib/database/config";

/**
 * Upload a file to Firebase Storage
 * @param file - File to upload
 * @param path - Storage path (e.g., "sellers/userId/shop/logo.jpg")
 * @returns Download URL of the uploaded file
 */
export async function uploadToFirebase(
  file: File,
  path: string,
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase:", error);
    throw error;
  }
}

/**
 * Upload multiple files to Firebase Storage
 * @param files - Array of files to upload
 * @param basePath - Base storage path (file names will be appended)
 * @returns Array of download URLs
 */
export async function uploadMultipleToFirebase(
  files: File[],
  basePath: string,
): Promise<string[]> {
  const uploadPromises = files.map((file, index) => {
    const path = `${basePath}/${Date.now()}-${index}-${file.name}`;
    return uploadToFirebase(file, path);
  });

  return Promise.all(uploadPromises);
}
