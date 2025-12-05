/**
 * Email Queue Processor
 *
 * Scheduled function to process pending emails from emailQueue collection
 *
 * @status IMPLEMENTED
 * @task 1.5.6
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v2";

/**
 * Process email queue every minute
 */
export const processEmailQueue = functions.scheduler.onSchedule(
  "every 1 minutes",
  async () => {
    try {
      const db = admin.firestore();

      // Get email settings
      const settingsDoc = await db.collection("settings").doc("email").get();
      const settings = settingsDoc.data();

      if (!settings || (!settings.resendEnabled && !settings.sendgridEnabled)) {
        functions.logger.warn("Email service not configured");
        return;
      }

      // Get pending emails (limit to 10 per execution to avoid timeout)
      const pendingEmailsSnapshot = await db
        .collection("emailQueue")
        .where("status", "==", "pending")
        .orderBy("createdAt", "asc")
        .limit(10)
        .get();

      if (pendingEmailsSnapshot.empty) {
        functions.logger.info("No pending emails");
        return;
      }

      functions.logger.info(
        `Processing ${pendingEmailsSnapshot.size} pending emails`
      );

      for (const emailDoc of pendingEmailsSnapshot.docs) {
        const emailData = emailDoc.data();

        try {
          // Check if category is enabled
          const category = emailData.category || "TRANSACTIONAL";
          const categorySettings = settings.categories?.[category];

          if (categorySettings && !categorySettings.enabled) {
            functions.logger.info(
              `Category ${category} is disabled, skipping email ${emailDoc.id}`
            );
            await emailDoc.ref.update({
              status: "skipped",
              skippedReason: "Category disabled",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            continue;
          }

          // Determine provider
          const provider =
            categorySettings?.provider || settings.defaultProvider || "resend";

          // Send email
          let messageId;
          if (provider === "resend" && settings.resendEnabled) {
            messageId = await sendViaResend(emailData, settings);
          } else if (provider === "sendgrid" && settings.sendgridEnabled) {
            messageId = await sendViaSendGrid(emailData, settings);
          } else {
            throw new Error(`Provider ${provider} not available`);
          }

          // Update status to sent
          await emailDoc.ref.update({
            status: "sent",
            provider,
            messageId,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Log to emailLogs
          await db.collection("emailLogs").add({
            to: emailData.to,
            template: emailData.template,
            status: "sent",
            provider,
            messageId,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          functions.logger.info(
            `Email ${emailDoc.id} sent successfully via ${provider}`
          );
        } catch (error) {
          functions.logger.error(`Error sending email ${emailDoc.id}:`, error);

          // Update retry count
          const retryCount = emailData.retryCount || 0;
          const maxRetries = settings.retryAttempts || 3;

          if (retryCount < maxRetries) {
            // Schedule retry
            const retryDelay = settings.retryDelay || 5000;
            const nextRetryAt = admin.firestore.Timestamp.fromMillis(
              Date.now() + retryDelay
            );

            await emailDoc.ref.update({
              retryCount: retryCount + 1,
              nextRetryAt,
              lastError: error instanceof Error ? error.message : String(error),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            functions.logger.info(
              `Email ${emailDoc.id} scheduled for retry ${
                retryCount + 1
              }/${maxRetries}`
            );
          } else {
            // Mark as failed
            await emailDoc.ref.update({
              status: "failed",
              lastError: error instanceof Error ? error.message : String(error),
              failedAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Log failure
            await db.collection("emailLogs").add({
              to: emailData.to,
              template: emailData.template,
              status: "failed",
              error: error instanceof Error ? error.message : String(error),
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            functions.logger.error(
              `Email ${emailDoc.id} failed after ${maxRetries} retries`
            );
          }
        }
      }
    } catch (error) {
      functions.logger.error("Error processing email queue:", error);
    }
  }
);

async function sendViaResend(emailData: any, settings: any): Promise<string> {
  // Dynamic import with type assertion to avoid TypeScript errors for uninstalled packages
  const resendModule = (await import("resend" as any)) as any;
  const Resend = resendModule.Resend;
  const resend = new Resend(settings.resendApiKey);

  // Render email template (simplified - should use actual React Email rendering)
  const subject =
    emailData.data?.subject || getDefaultSubject(emailData.template);

  const result = await resend.emails.send({
    from: `${settings.resendFromName} <${settings.resendFromEmail}>`,
    to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
    subject,
    html: await renderEmailTemplate(emailData.template, emailData.data),
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data?.id || "unknown";
}

async function sendViaSendGrid(emailData: any, settings: any): Promise<string> {
  // Dynamic import with type assertion to avoid TypeScript errors for uninstalled packages
  const sgMail = (await import("@sendgrid/mail" as any)) as any;
  sgMail.default.setApiKey(settings.sendgridApiKey);

  const subject =
    emailData.data?.subject || getDefaultSubject(emailData.template);

  const result = await sgMail.default.send({
    from: {
      name: settings.sendgridFromName,
      email: settings.sendgridFromEmail,
    },
    to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
    subject,
    html: await renderEmailTemplate(emailData.template, emailData.data),
  });

  return result[0].headers["x-message-id"] || "unknown";
}

async function renderEmailTemplate(
  template: string,
  data: any
): Promise<string> {
  // This is a simplified version - in production, you'd use @react-email/render
  // to render the actual React Email components from src/emails/

  // For now, return basic HTML that can be replaced with proper rendering
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Email from JustForView.in</h2>
        <p>Template: ${template}</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 14px;">
          © ${new Date().getFullYear()} JustForView.in. All rights reserved.
        </p>
      </body>
    </html>
  `;
}

function getDefaultSubject(template: string): string {
  const subjects: Record<string, string> = {
    order_confirmation: "Order Confirmation",
    shipping_update: "Shipping Update",
    order_delivered: "Order Delivered",
    payment_received: "Payment Received",
    auction_won: "Congratulations! You Won the Auction",
    bid_outbid: "You've Been Outbid",
    auction_ending_soon: "Auction Ending Soon",
    welcome: "Welcome to JustForView.in!",
    email_verification: "Verify Your Email",
    password_reset: "Password Reset Request",
    newsletter: "Newsletter",
    newsletter_confirm: "Confirm Newsletter Subscription",
    newsletter_welcome: "Welcome to Our Newsletter",
  };
  return subjects[template] || "Email from JustForView.in";
}
