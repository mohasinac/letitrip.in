import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import type { ObjectMetadata } from "firebase-functions/v1/storage";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const sharp = require("sharp");

const storage = admin.storage();
const db = admin.firestore();

/**
 * Firebase Storage trigger: Optimize and generate thumbnails for uploaded images
 * - Generate multiple thumbnail sizes (small, medium, large)
 * - Optimize image compression
 * - Update Firestore document with thumbnail URLs
 */
export const onImageUpload = functions.storage
  .object()
  .onFinalize(async (object: ObjectMetadata) => {
    const filePath = object.name || "";
    const contentType = object.contentType || "";

    // Only process images
    if (!contentType.startsWith("image/")) {
      console.log("Not an image, skipping");
      return null;
    }

    // Skip if already a thumbnail
    if (filePath.includes("_thumb_")) {
      console.log("Already a thumbnail, skipping");
      return null;
    }

    const bucket = storage.bucket(object.bucket);
    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);
    const tempFilePath = path.join(os.tmpdir(), fileName);

    try {
      // 1. Download image to temp directory
      await bucket.file(filePath).download({ destination: tempFilePath });
      console.log(`Downloaded ${fileName} to ${tempFilePath}`);

      // 2. Get image metadata
      const metadata = await sharp(tempFilePath).metadata();
      console.log(`Image metadata:`, metadata);

      // 3. Define thumbnail sizes
      const sizes = [
        { name: "small", width: 150, height: 150 },
        { name: "medium", width: 400, height: 400 },
        { name: "large", width: 800, height: 800 },
      ];

      const uploadPromises: Promise<any>[] = [];
      const thumbnailUrls: Record<string, string> = {};

      // 4. Generate thumbnails
      for (const size of sizes) {
        const thumbFileName = `${path.parse(fileName).name}_thumb_${
          size.name
        }${path.extname(fileName)}`;
        const thumbFilePath = path.join(os.tmpdir(), thumbFileName);
        const thumbStoragePath = path.join(fileDir, thumbFileName);

        // Create thumbnail with sharp
        await sharp(tempFilePath)
          .resize(size.width, size.height, {
            fit: "cover",
            position: "center",
          })
          .jpeg({ quality: 85, progressive: true })
          .toFile(thumbFilePath);

        console.log(`Generated ${size.name} thumbnail: ${thumbFileName}`);

        // Upload thumbnail to storage
        const uploadPromise = bucket
          .upload(thumbFilePath, {
            destination: thumbStoragePath,
            metadata: {
              contentType: "image/jpeg",
              metadata: {
                originalFile: filePath,
                thumbnailSize: size.name,
              },
            },
          })
          .then(async ([file]) => {
            // Make file publicly accessible
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${thumbStoragePath}`;
            thumbnailUrls[size.name] = publicUrl;

            // Clean up temp file
            fs.unlinkSync(thumbFilePath);
          });

        uploadPromises.push(uploadPromise);
      }

      // 5. Wait for all thumbnails to upload
      await Promise.all(uploadPromises);

      // 6. Optimize original image
      const optimizedFilePath = path.join(os.tmpdir(), `optimized_${fileName}`);

      await sharp(tempFilePath)
        .jpeg({ quality: 90, progressive: true })
        .toFile(optimizedFilePath);

      // Replace original with optimized version
      await bucket.upload(optimizedFilePath, {
        destination: filePath,
        metadata: {
          contentType: "image/jpeg",
        },
      });

      console.log(`Optimized original image: ${fileName}`);

      // 7. Get original image public URL
      await bucket.file(filePath).makePublic();
      const originalUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      // 8. Update Firestore document with thumbnail URLs
      // Extract document path from storage path
      // Expected format: products/{productId}/images/{imageId} or similar
      const pathParts = fileDir.split("/");

      if (pathParts.length >= 2) {
        const collection = pathParts[0];
        const docId = pathParts[1];

        // Update document based on collection
        if (
          collection === "products" ||
          collection === "shops" ||
          collection === "users"
        ) {
          const docRef = db.collection(collection).doc(docId);
          const doc = await docRef.get();

          if (doc.exists) {
            await docRef.update({
              images: admin.firestore.FieldValue.arrayUnion({
                original: originalUrl,
                thumbnails: thumbnailUrls,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
              }),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`Updated ${collection}/${docId} with thumbnail URLs`);
          }
        }
      }

      // 9. Clean up temp files
      fs.unlinkSync(tempFilePath);
      fs.unlinkSync(optimizedFilePath);

      console.log(`Successfully processed image: ${fileName}`);
      return null;
    } catch (error) {
      console.error("Error processing image:", error);

      // Clean up temp files on error
      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }

      throw error;
    }
  });

/**
 * Delete thumbnails when original image is deleted
 */
export const onImageDelete = functions.storage
  .object()
  .onDelete(async (object: ObjectMetadata) => {
    const filePath = object.name || "";
    const contentType = object.contentType || "";

    // Only process images
    if (!contentType.startsWith("image/")) {
      return null;
    }

    // Skip if already a thumbnail
    if (filePath.includes("_thumb_")) {
      return null;
    }

    const bucket = storage.bucket(object.bucket);
    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);

    try {
      // Delete all thumbnail variants
      const sizes = ["small", "medium", "large"];
      const deletePromises = sizes.map((size) => {
        const thumbFileName = `${
          path.parse(fileName).name
        }_thumb_${size}${path.extname(fileName)}`;
        const thumbStoragePath = path.join(fileDir, thumbFileName);

        return bucket
          .file(thumbStoragePath)
          .delete()
          .catch((err) => {
            // Ignore if thumbnail doesn't exist
            console.log(
              `Thumbnail ${thumbFileName} not found or already deleted`
            );
          });
      });

      await Promise.all(deletePromises);

      console.log(`Deleted thumbnails for: ${fileName}`);
      return null;
    } catch (error) {
      console.error("Error deleting thumbnails:", error);
      return null;
    }
  });
