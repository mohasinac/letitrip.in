/**
 * Firebase Storage Service
 * Handles all Firebase Storage operations with proper error handling and validation
 * Server-side operations using Firebase Admin SDK
 */

import { getAdminStorage, getAdminDb } from "@/app/api/_lib/database/admin";
import { STORAGE_CONSTANTS, DATABASE_CONSTANTS } from "@/constants/app";

interface FileMetadata {
  url: string;
  filepath: string;
  filename: string;
  size: number;
  type: string;
  bucket: string;
  createdAt: string;
  uploadedBy: string;
}

interface StorageFile {
  id: string;
  metadata: FileMetadata;
  userId: string;
  folder: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export class StorageService {
  private readonly storage = getAdminStorage();
  private readonly db = getAdminDb();
  private readonly filesCollection = "storage_files";

  /**
   * Upload file to Firebase Storage
   */
  async uploadFile(
    file: Buffer,
    filename: string,
    folder: string,
    userId: string,
    contentType: string,
    isPublic: boolean = true,
  ): Promise<FileMetadata> {
    try {
      // Validate file
      this.validateFile(file, filename, contentType);

      const bucket = this.storage.bucket();
      const filepath = `${folder}/${filename}`;
      const fileRef = bucket.file(filepath);

      // Upload file
      await fileRef.save(file, {
        metadata: {
          contentType,
          metadata: {
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
            originalName: filename,
          },
        },
        public: isPublic,
      });

      // Make file public if required
      if (isPublic) {
        await fileRef.makePublic();
      }

      const metadata: FileMetadata = {
        url: `https://storage.googleapis.com/${bucket.name}/${filepath}`,
        filepath,
        filename,
        size: file.length,
        type: contentType,
        bucket: bucket.name,
        createdAt: new Date().toISOString(),
        uploadedBy: userId,
      };

      // Save metadata to Firestore
      const storageFile = {
        metadata,
        userId,
        folder,
        isPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await this.db
        .collection(this.filesCollection)
        .add(storageFile as StorageFile);

      return metadata;
    } catch (error) {
      console.error("Storage upload error:", error);
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete file from Firebase Storage
   */
  async deleteFile(filepath: string, userId?: string): Promise<void> {
    try {
      const bucket = this.storage.bucket();
      const file = bucket.file(filepath);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error("File not found");
      }

      // Delete from storage
      await file.delete();

      // Delete metadata from Firestore
      if (userId) {
        const snapshot = await this.db
          .collection(this.filesCollection)
          .where("filepath", "==", filepath)
          .where("userId", "==", userId)
          .get();

        const batch = this.db.batch();
        snapshot.docs.forEach((doc: any) => {
          batch.delete(doc.ref);
        });

        if (snapshot.docs.length > 0) {
          await batch.commit();
        }
      }
    } catch (error) {
      console.error("Storage delete error:", error);
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filepath: string): Promise<FileMetadata | null> {
    try {
      const bucket = this.storage.bucket();
      const file = bucket.file(filepath);

      const [exists] = await file.exists();
      if (!exists) return null;

      const [metadata] = await file.getMetadata();

      return {
        url: `https://storage.googleapis.com/${bucket.name}/${filepath}`,
        filepath,
        filename: filepath.split("/").pop() || "",
        size: typeof metadata.size === "number" ? metadata.size : 0,
        type: metadata.contentType || "application/octet-stream",
        bucket: bucket.name,
        createdAt: metadata.timeCreated || new Date().toISOString(),
        uploadedBy:
          typeof metadata.metadata?.uploadedBy === "string"
            ? metadata.metadata.uploadedBy
            : "unknown",
      };
    } catch (error) {
      console.error("Error getting file metadata:", error);
      return null;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(
    folder: string,
    maxResults: number = 100,
  ): Promise<FileMetadata[]> {
    try {
      const bucket = this.storage.bucket();
      const [files] = await bucket.getFiles({
        prefix: folder,
        maxResults,
      });

      const fileMetadata: FileMetadata[] = [];

      for (const file of files) {
        const [metadata] = await file.getMetadata();
        fileMetadata.push({
          url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
          filepath: file.name,
          filename: file.name.split("/").pop() || "",
          size: typeof metadata.size === "number" ? metadata.size : 0,
          type: metadata.contentType || "application/octet-stream",
          bucket: bucket.name,
          createdAt: metadata.timeCreated || new Date().toISOString(),
          uploadedBy:
            typeof metadata.metadata?.uploadedBy === "string"
              ? metadata.metadata.uploadedBy
              : "unknown",
        });
      }

      return fileMetadata;
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  }

  /**
   * Get file download URL
   */
  async getDownloadUrl(
    filepath: string,
    expiresInHours: number = 24,
  ): Promise<string> {
    try {
      const bucket = this.storage.bucket();
      const file = bucket.file(filepath);

      const [exists] = await file.exists();
      if (!exists) {
        throw new Error("File not found");
      }

      const [url] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + expiresInHours * 60 * 60 * 1000,
      });

      return url;
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw new Error(
        `Failed to generate download URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get user's uploaded files
   */
  async getUserFiles(userId: string, folder?: string): Promise<StorageFile[]> {
    try {
      let query = this.db
        .collection(this.filesCollection)
        .where("userId", "==", userId);

      if (folder) {
        query = query.where("folder", "==", folder);
      }

      const snapshot = await query.orderBy("createdAt", "desc").get();

      return snapshot.docs.map(
        (doc: any) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as StorageFile,
      );
    } catch (error) {
      console.error("Error getting user files:", error);
      return [];
    }
  }

  /**
   * Delete user's files in a folder
   */
  async deleteUserFilesInFolder(
    userId: string,
    folder: string,
  ): Promise<number> {
    try {
      const files = await this.getUserFiles(userId, folder);
      let deletedCount = 0;

      for (const file of files) {
        try {
          await this.deleteFile(file.metadata.filepath, userId);
          deletedCount++;
        } catch (error) {
          console.error(
            `Failed to delete file ${file.metadata.filepath}:`,
            error,
          );
        }
      }

      return deletedCount;
    } catch (error) {
      console.error("Error deleting user files:", error);
      return 0;
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(
    file: Buffer,
    filename: string,
    contentType: string,
  ): void {
    // Check file size
    const maxSize = contentType.startsWith("video/")
      ? STORAGE_CONSTANTS.MAX_VIDEO_SIZE_MB * 1024 * 1024
      : STORAGE_CONSTANTS.MAX_FILE_SIZE_MB * 1024 * 1024;

    if (file.length > maxSize) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file type
    const isImage = (
      STORAGE_CONSTANTS.ALLOWED_IMAGE_TYPES as readonly string[]
    ).includes(contentType);
    const isVideo = (
      STORAGE_CONSTANTS.ALLOWED_VIDEO_TYPES as readonly string[]
    ).includes(contentType);

    if (!isImage && !isVideo) {
      throw new Error("Invalid file type. Only images and videos are allowed.");
    }

    // Check filename
    if (!filename || filename.trim().length === 0) {
      throw new Error("Invalid filename");
    }
  }
}

export const storageService = new StorageService();
