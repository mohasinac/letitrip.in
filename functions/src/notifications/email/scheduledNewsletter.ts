/**
 * Email Notifications - Scheduled Newsletter
 *
 * Firebase Function for sending scheduled newsletter campaigns
 *
 * @status IMPLEMENTED
 * @task 1.5.6
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v2";

interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  frequency: "weekly" | "monthly";
  lastSentAt?: admin.firestore.Timestamp;
  status: "active" | "paused" | "draft";
}

/**
 * Scheduled function to send weekly newsletters
 * Runs every Monday at 10:00 AM IST
 */
export const sendWeeklyNewsletter = functions.scheduler.onSchedule(
  {
    schedule: "0 10 * * 1",
    timeZone: "Asia/Kolkata",
  },
  async () => {
    try {
      const db = admin.firestore();

      // Get active weekly campaign
      const campaignQuery = await db
        .collection("newsletterCampaigns")
        .where("frequency", "==", "weekly")
        .where("status", "==", "active")
        .limit(1)
        .get();

      if (campaignQuery.empty) {
        functions.logger.info("No active weekly newsletter campaign found");
        return;
      }

      const campaignDoc = campaignQuery.docs[0];
      const campaign = {
        id: campaignDoc.id,
        ...campaignDoc.data(),
      } as NewsletterCampaign;

      await sendNewsletter(campaign);

      // Update last sent time
      await campaignDoc.ref.update({
        lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Weekly newsletter campaign ${campaign.id} sent successfully`
      );
    } catch (error) {
      functions.logger.error("Error sending weekly newsletter:", error);
    }
  }
);

/**
 * Scheduled function to send monthly newsletters
 * Runs on the 1st of every month at 10:00 AM IST
 */
export const sendMonthlyNewsletter = functions.scheduler.onSchedule(
  {
    schedule: "0 10 1 * *",
    timeZone: "Asia/Kolkata",
  },
  async () => {
    try {
      const db = admin.firestore();

      // Get active monthly campaign
      const campaignQuery = await db
        .collection("newsletterCampaigns")
        .where("frequency", "==", "monthly")
        .where("status", "==", "active")
        .limit(1)
        .get();

      if (campaignQuery.empty) {
        functions.logger.info("No active monthly newsletter campaign found");
        return;
      }

      const campaignDoc = campaignQuery.docs[0];
      const campaign = {
        id: campaignDoc.id,
        ...campaignDoc.data(),
      } as NewsletterCampaign;

      await sendNewsletter(campaign);

      // Update last sent time
      await campaignDoc.ref.update({
        lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Monthly newsletter campaign ${campaign.id} sent successfully`
      );
    } catch (error) {
      functions.logger.error("Error sending monthly newsletter:", error);
    }
  }
);

/**
 * Send newsletter to all subscribed users
 * Implements batch processing with rate limiting
 */
async function sendNewsletter(campaign: NewsletterCampaign): Promise<void> {
  const db = admin.firestore();

  // Get all subscribed users
  const usersQuery = await db
    .collection("users")
    .where("emailPreferences.marketing", "==", true)
    .where("newsletterSubscribed", "==", true)
    .limit(1000) // Limit per campaign send
    .get();

  functions.logger.info(
    `Sending newsletter to ${usersQuery.size} subscribed users`
  );

  const BATCH_SIZE = 100;
  const RATE_LIMIT_DELAY_MS = 1000; // 1 second delay between batches

  // Process in batches
  const users = usersQuery.docs;
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    // Send emails in parallel for this batch
    const emailPromises = batch.map(async (userDoc) => {
      const userData = userDoc.data();
      if (!userData.email) return;

      try {
        // Add to email queue
        await db.collection("emailQueue").add({
          to: userData.email,
          template: "newsletter",
          category: "MARKETING",
          data: {
            userName: userData.displayName || userData.name || "Subscriber",
            subject: campaign.subject,
            content: campaign.content,
            unsubscribeLink: `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/unsubscribe?email=${userData.email}`,
          },
          campaignId: campaign.id,
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        functions.logger.error(
          `Error queueing newsletter for user ${userDoc.id}:`,
          error
        );
      }
    });

    await Promise.all(emailPromises);

    functions.logger.info(
      `Queued batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} emails)`
    );

    // Rate limiting delay (except for last batch)
    if (i + BATCH_SIZE < users.length) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }
  }

  // Log campaign send
  await db.collection("campaignLogs").add({
    campaignId: campaign.id,
    frequency: campaign.frequency,
    subject: campaign.subject,
    recipientCount: usersQuery.size,
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
    status: "completed",
  });

  functions.logger.info(
    `Newsletter campaign ${campaign.id} queued for ${usersQuery.size} recipients`
  );
}
