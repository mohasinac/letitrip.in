/**
 * Firebase Function: Bulk WhatsApp Messages
 *
 * Scheduled function or HTTP callable for bulk WhatsApp campaigns
 * Supports user segmentation and rate limiting
 * Logs all messages to Firestore for audit trail
 */

import * as functions from "firebase-functions/v1";
import { adminDb } from "../../config/firebase-admin";
import { logNotification, sendWhatsAppMessage, type UserData } from "./shared";

// Rate limiting: max messages per batch
const MAX_MESSAGES_PER_BATCH = 100;
const RATE_LIMIT_DELAY_MS = 1000; // 1 second delay between batches

interface CampaignRequest {
  campaignId: string;
  message: string;
  segment?: {
    tags?: string[];
    minOrders?: number;
    lastOrderDays?: number;
  };
  scheduledAt?: string;
}

/**
 * Get users based on segment criteria
 */
async function getSegmentedUsers(
  segment?: CampaignRequest["segment"]
): Promise<UserData[]> {
  try {
    let query: FirebaseFirestore.Query = adminDb
      .collection("users")
      .where("whatsappOptIn", "==", true);

    // Apply tag filter if specified
    if (segment?.tags && segment.tags.length > 0) {
      query = query.where("tags", "array-contains-any", segment.tags);
    }

    // Apply minimum orders filter
    if (segment?.minOrders !== undefined) {
      query = query.where("totalOrders", ">=", segment.minOrders);
    }

    const snapshot = await query.limit(1000).get(); // Limit to 1000 users per campaign

    let users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<UserData, "id">),
    }));

    // Apply last order date filter (client-side)
    if (segment?.lastOrderDays !== undefined) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - segment.lastOrderDays);

      users = users.filter((user) => {
        if (!user.lastOrderDate) return false;
        const lastOrder = new Date(user.lastOrderDate);
        return lastOrder >= cutoffDate;
      });
    }

    return users;
  } catch (error) {
    console.error("Failed to fetch segmented users:", error);
    throw error;
  }
}

/**
 * Personalize message with user data
 */
function personalizeMessage(template: string, user: UserData): string {
  return template
    .replace(/\{name\}/g, user.name)
    .replace(/\{firstName\}/g, user.name.split(" ")[0]);
}

/**
 * Update campaign status
 */
async function updateCampaignStatus(
  campaignId: string,
  status: string,
  sentCount: number,
  failedCount: number
): Promise<void> {
  try {
    await adminDb.collection("campaigns").doc(campaignId).update({
      status,
      sentCount,
      failedCount,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Failed to update campaign ${campaignId}:`, error);
  }
}

/**
 * Process bulk messages with rate limiting
 */
async function processBulkMessages(
  users: UserData[],
  message: string,
  campaignId: string
): Promise<{ sent: number; failed: number }> {
  let sentCount = 0;
  let failedCount = 0;

  // Process in batches to avoid rate limits
  for (let i = 0; i < users.length; i += MAX_MESSAGES_PER_BATCH) {
    const batch = users.slice(i, i + MAX_MESSAGES_PER_BATCH);

    console.log(
      `Processing batch ${Math.floor(i / MAX_MESSAGES_PER_BATCH) + 1}: ${
        batch.length
      } messages`
    );

    // Send messages in parallel within batch
    const results = await Promise.all(
      batch.map(async (user) => {
        const personalizedMessage = personalizeMessage(message, user);
        const result = await sendWhatsAppMessage(
          user.phone,
          personalizedMessage
        );

        await logNotification({
          userId: user.id!,
          campaignId,
          type: "campaign_message",
          status: result.success ? "sent" : "failed",
          messageId: result.messageId,
          error: result.error,
        });

        return result.success;
      })
    );

    // Count successes and failures
    sentCount += results.filter((success) => success).length;
    failedCount += results.filter((success) => !success).length;

    // Delay between batches to respect rate limits
    if (i + MAX_MESSAGES_PER_BATCH < users.length) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }
  }

  return { sent: sentCount, failed: failedCount };
}

/**
 * Firebase HTTP Function: Send bulk WhatsApp messages
 */
export const sendBulkWhatsApp = functions.https.onCall(
  async (data: CampaignRequest, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to send bulk messages"
      );
    }

    // Verify admin role
    const userDoc = await adminDb
      .collection("users")
      .doc(context.auth.uid)
      .get();
    const userData = userDoc.data();

    if (userData?.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can send bulk messages"
      );
    }

    const { campaignId, message, segment } = data;

    if (!campaignId || !message) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "campaignId and message are required"
      );
    }

    try {
      console.log(`Starting bulk WhatsApp campaign: ${campaignId}`);

      // Get segmented users
      const users = await getSegmentedUsers(segment);

      if (users.length === 0) {
        throw new functions.https.HttpsError(
          "not-found",
          "No users found matching the segment criteria"
        );
      }

      console.log(`Found ${users.length} users for campaign`);

      // Update campaign status to processing
      await updateCampaignStatus(campaignId, "processing", 0, 0);

      // Process bulk messages
      const { sent, failed } = await processBulkMessages(
        users,
        message,
        campaignId
      );

      // Update final campaign status
      await updateCampaignStatus(campaignId, "completed", sent, failed);

      console.log(
        `Campaign ${campaignId} completed: ${sent} sent, ${failed} failed`
      );

      return {
        success: true,
        sent,
        failed,
        total: users.length,
      };
    } catch (error) {
      console.error(`Campaign ${campaignId} failed:`, error);

      await updateCampaignStatus(campaignId, "failed", 0, 0);

      throw new functions.https.HttpsError(
        "internal",
        error instanceof Error ? error.message : "Campaign failed"
      );
    }
  }
);
