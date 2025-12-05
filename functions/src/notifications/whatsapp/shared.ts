/**
 * Shared WhatsApp Utilities
 *
 * Common functions for WhatsApp notification Firebase Functions
 * Handles message sending, phone formatting, and logging
 */

import axios from "axios";
import { adminDb } from "../../config/firebase-admin";

// WhatsApp Provider Configuration
const WHATSAPP_PROVIDER = process.env.WHATSAPP_PROVIDER || "twilio";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY;
const GUPSHUP_APP_NAME = process.env.GUPSHUP_APP_NAME;

export interface UserData {
  id?: string;
  phone: string;
  name: string;
  whatsappOptIn?: boolean;
  tags?: string[];
  lastOrderDate?: string;
  totalOrders?: number;
}

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get user data from Firestore
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data() as UserData;

    // Check WhatsApp opt-in
    if (userData.whatsappOptIn === false) {
      console.log(`User ${userId} has opted out of WhatsApp`);
      return null;
    }

    return { ...userData, id: userId };
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error);
    return null;
  }
}

/**
 * Format phone number for WhatsApp (E.164 format)
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");

  if (!cleaned.startsWith("91") && cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }

  return "+" + cleaned;
}

/**
 * Send WhatsApp message via Twilio
 */
async function sendViaTwilio(
  to: string,
  message: string
): Promise<MessageResult> {
  try {
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
        To: `whatsapp:${to}`,
        Body: message,
      }),
      {
        auth: {
          username: TWILIO_ACCOUNT_SID!,
          password: TWILIO_AUTH_TOKEN!,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return {
      success: true,
      messageId: response.data.sid,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send WhatsApp message via Gupshup
 */
async function sendViaGupshup(
  to: string,
  message: string
): Promise<MessageResult> {
  try {
    const response = await axios.post(
      "https://api.gupshup.io/sm/api/v1/msg",
      new URLSearchParams({
        channel: "whatsapp",
        source: GUPSHUP_APP_NAME!,
        destination: to,
        "src.name": GUPSHUP_APP_NAME!,
        message: message,
      }),
      {
        headers: {
          apikey: GUPSHUP_API_KEY!,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return {
      success: response.data.status === "submitted",
      messageId: response.data.messageId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send WhatsApp message (provider-agnostic)
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<MessageResult> {
  const formattedPhone = formatPhoneNumber(to);

  if (WHATSAPP_PROVIDER === "gupshup") {
    return sendViaGupshup(formattedPhone, message);
  } else {
    return sendViaTwilio(formattedPhone, message);
  }
}

/**
 * Log notification to Firestore
 */
export async function logNotification(data: {
  userId: string;
  type: string;
  status: "sent" | "failed";
  messageId?: string;
  error?: string;
  orderId?: string;
  auctionId?: string;
  bidId?: string;
  campaignId?: string;
}): Promise<void> {
  try {
    const collectionName = data.campaignId
      ? "campaignLogs"
      : "notificationLogs";

    await adminDb.collection(collectionName).add({
      ...data,
      channel: "whatsapp",
      createdAt: new Date().toISOString(),
    });
  } catch (logError) {
    console.error("Failed to log notification:", logError);
  }
}
