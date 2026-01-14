/**
 * Temporary File Cleanup - Scheduled Function
 * 
 * Runs daily to delete temporary uploaded files that are older than 24 hours
 * and marked with autoDelete metadata
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const cleanupTemporaryFiles = functions.pubsub
  .schedule("0 2 * * *") // Run at 2 AM daily
  .timeZone("Asia/Kolkata")
  .onRun(async (context) => {
    const bucket = admin.storage().bucket();
    const firestore = admin.firestore();
    
    try {
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      
      // Query temporary uploads collection
      const tempUploadsSnapshot = await firestore
        .collection("temporaryUploads")
        .where("autoDelete", "==", true)
        .where("uploadedAt", "<", new Date(oneDayAgo))
        .get();
      
      if (tempUploadsSnapshot.empty) {
        console.log("No temporary files to clean up");
        return null;
      }
      
      const deletionPromises: Promise<void>[] = [];
      const docDeletionPromises: Promise<void>[] = [];
      
      for (const doc of tempUploadsSnapshot.docs) {
        const data = doc.data();
        const filePath = data.filePath;
        
        if (filePath) {
          // Delete file from storage
          deletionPromises.push(
            bucket
              .file(filePath)
              .delete()
              .then(() => {
                console.log(`Deleted file: ${filePath}`);
              })
              .catch((error) => {
                console.error(`Failed to delete ${filePath}:`, error);
              })
          );
          
          // Delete Firestore document
          docDeletionPromises.push(
            doc.ref.delete().then(() => {
              console.log(`Deleted doc: ${doc.id}`);
            })
          );
        }
      }
      
      await Promise.all([...deletionPromises, ...docDeletionPromises]);
      
      console.log(`Cleanup complete. Processed ${tempUploadsSnapshot.size} files`);
      return null;
    } catch (error) {
      console.error("Error in cleanup function:", error);
      throw error;
    }
  });
