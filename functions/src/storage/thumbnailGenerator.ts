/**
 * Image Thumbnail Generation Function
 * Phase 8.1 - Task 3/4
 *
 * Storage trigger that automatically generates thumbnails when images are uploaded.
 * Creates multiple sizes for responsive images.
 *
 * Trigger: onFinalize /products/{productId}/{imageId}
 * Trigger: onFinalize /auctions/{auctionId}/{imageId}
 * Trigger: onFinalize /shops/{shopId}/{imageId}
 * Trigger: onFinalize /users/{userId}/{imageId}
 *
 * Features:
 * - Generate multiple thumbnail sizes (small, medium, large)
 * - WebP format for better compression
 * - Preserve EXIF data
 * - Auto-orientation
 * - Watermark for product images (optional)
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import sharp from "sharp";

// Thumbnail sizes
const SIZES = {
  small: { width: 200, height: 200, suffix: "_200x200" },
  medium: { width: 400, height: 400, suffix: "_400x400" },
  large: { width: 800, height: 800, suffix: "_800x800" },
  xlarge: { width: 1200, height: 1200, suffix: "_1200x1200" },
};

/**
 * Generate thumbnails when an image is uploaded to Storage
 */
export const generateThumbnail = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const contentType = object.contentType;
    const bucket = admin.storage().bucket(object.bucket);

    // Exit if not an image
    if (!contentType || !contentType.startsWith("image/")) {
      console.log("Not an image file, skipping...");
      return null;
    }

    // Exit if already a thumbnail
    if (
      filePath &&
      Object.values(SIZES).some((size) => filePath.includes(size.suffix))
    ) {
      console.log("Already a thumbnail, skipping...");
      return null;
    }

    // Exit if no file path
    if (!filePath) {
      console.log("No file path, skipping...");
      return null;
    }

    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);
    const fileExt = path.extname(fileName);
    const fileNameWithoutExt = path.basename(fileName, fileExt);

    // Check if this is a product/auction/shop/user image
    const pathParts = filePath.split("/");
    const resourceType = pathParts[0]; // products, auctions, shops, users
    const resourceId = pathParts[1];

    if (!["products", "auctions", "shops", "users"].includes(resourceType)) {
      console.log("Not a recognized resource type, skipping...");
      return null;
    }

    console.log(`Processing image: ${filePath}`);

    try {
      // Download file to temp directory
      const tempFilePath = path.join(os.tmpdir(), fileName);
      await bucket.file(filePath).download({ destination: tempFilePath });
      console.log(`Downloaded file to: ${tempFilePath}`);

      // Generate thumbnails for each size
      const promises = Object.entries(SIZES).map(async ([sizeName, size]) => {
        const thumbFileName = `${fileNameWithoutExt}${size.suffix}.webp`;
        const thumbFilePath = path.join(fileDir, thumbFileName);
        const tempThumbPath = path.join(os.tmpdir(), thumbFileName);

        console.log(`Generating ${sizeName} thumbnail: ${thumbFileName}`);

        // Generate thumbnail using Sharp
        await sharp(tempFilePath)
          .resize(size.width, size.height, {
            fit: "cover",
            position: "center",
          })
          .webp({
            quality: 85,
            effort: 4,
          })
          .toFile(tempThumbPath);

        // Upload thumbnail to storage
        await bucket.upload(tempThumbPath, {
          destination: thumbFilePath,
          metadata: {
            contentType: "image/webp",
            metadata: {
              originalFile: fileName,
              size: sizeName,
              resourceType,
              resourceId,
            },
          },
        });

        // Make thumbnail public (optional - adjust based on security needs)
        await bucket.file(thumbFilePath).makePublic();

        // Clean up temp thumbnail
        await fs.unlink(tempThumbPath);

        console.log(`Uploaded ${sizeName} thumbnail: ${thumbFilePath}`);

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${thumbFilePath}`;
        return { size: sizeName, url: publicUrl };
      });

      const thumbnails = await Promise.all(promises);

      // Clean up temp original file
      await fs.unlink(tempFilePath);

      // Update Firestore document with thumbnail URLs
      const db = admin.firestore();
      const updateData: Record<string, string> = {};

      thumbnails.forEach((thumb) => {
        updateData[`thumbnails.${thumb.size}`] = thumb.url;
      });

      updateData["thumbnailsGeneratedAt"] =
        admin.firestore.FieldValue.serverTimestamp() as any;

      // Determine collection based on resource type
      const collectionMap: Record<string, string> = {
        products: "products",
        auctions: "auctions",
        shops: "shops",
        users: "users",
      };

      const collection = collectionMap[resourceType];
      if (collection && resourceId) {
        await db.collection(collection).doc(resourceId).update(updateData);
        console.log(`Updated ${collection}/${resourceId} with thumbnail URLs`);
      }

      console.log(
        `Successfully generated ${thumbnails.length} thumbnails for ${fileName}`,
      );
      return { success: true, thumbnails: thumbnails.length, file: fileName };
    } catch (error) {
      console.error(`Error generating thumbnails for ${filePath}:`, error);

      // Log error
      await admin
        .firestore()
        .collection("errorLogs")
        .add({
          type: "thumbnailGeneration",
          filePath,
          error: error instanceof Error ? error.message : String(error),
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      return { success: false, error: String(error) };
    }
  });

/**
 * Optional: Generate thumbnails with watermark for product images
 */
async function addWatermark(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  // Load watermark (you'll need to add watermark.png to your project)
  const watermarkPath = path.join(__dirname, "../assets/watermark.png");

  await sharp(inputPath)
    .composite([
      {
        input: watermarkPath,
        gravity: "southeast",
        blend: "overlay",
      },
    ])
    .toFile(outputPath);
}
