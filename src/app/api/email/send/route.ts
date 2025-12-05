/**
 * Send Email API Route
 * POST /api/email/send
 *
 * Send emails through the email service using templates
 * Frontend sends template type + data, backend generates the email
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { emailService } from "@/app/api/lib/email/email.service";
import {
  getAuctionWonTemplate,
  getBidOutbidTemplate,
} from "@/app/api/lib/email/templates/auction.templates";
import {
  getOrderConfirmationTemplate,
  getShippingUpdateTemplate,
} from "@/app/api/lib/email/templates/order.templates";
import {
  getPasswordResetEmailTemplate,
  getPasswordResetEmailText,
} from "@/app/api/lib/email/templates/password-reset.template";
import {
  getVerificationEmailTemplate,
  getVerificationEmailText,
} from "@/app/api/lib/email/templates/verification.template";
import {
  getWelcomeEmailTemplate,
  getWelcomeEmailText,
} from "@/app/api/lib/email/templates/welcome.template";
import { NextRequest, NextResponse } from "next/server";

// Template types
type EmailTemplateType =
  | "verification"
  | "password_reset"
  | "welcome"
  | "order_confirmation"
  | "shipping_update"
  | "auction_won"
  | "bid_outbid";

interface SendTemplateEmailRequest {
  to: string | string[];
  template: EmailTemplateType;
  data: Record<string, unknown>;
  replyTo?: string;
}

// Template subjects
const TEMPLATE_SUBJECTS: Record<EmailTemplateType, string> = {
  verification: "Verify your email address - Letitrip",
  password_reset: "Reset your password - Letitrip",
  welcome: "Welcome to Letitrip! 🎉",
  order_confirmation: "Order Confirmed! - Letitrip",
  shipping_update: "Your order is on the way! - Letitrip",
  auction_won: "Congratulations! You won the auction! - Letitrip",
  bid_outbid: "You've been outbid - Letitrip",
};

// Generate email content based on template type
function generateEmailContent(
  template: EmailTemplateType,
  data: Record<string, unknown>
): { html: string; text: string } {
  switch (template) {
    case "verification":
      return {
        html: getVerificationEmailTemplate(
          data.name as string,
          data.verificationLink as string
        ),
        text: getVerificationEmailText(
          data.name as string,
          data.verificationLink as string
        ),
      };

    case "password_reset":
      return {
        html: getPasswordResetEmailTemplate(
          data.name as string,
          data.resetLink as string
        ),
        text: getPasswordResetEmailText(
          data.name as string,
          data.resetLink as string
        ),
      };

    case "welcome":
      return {
        html: getWelcomeEmailTemplate(data.name as string),
        text: getWelcomeEmailText(data.name as string),
      };

    case "order_confirmation":
      return {
        html: getOrderConfirmationTemplate({
          customerName: data.customerName as string,
          orderNumber: data.orderNumber as string,
          orderDate: data.orderDate as string,
          items: data.items as Array<{
            name: string;
            quantity: number;
            price: number;
          }>,
          subtotal: data.subtotal as number,
          shipping: data.shipping as number,
          total: data.total as number,
          shippingAddress: data.shippingAddress as string,
        }),
        text: `Order Confirmation\n\nHi ${data.customerName},\n\nYour order #${
          data.orderNumber
        } has been confirmed.\n\nTotal: ₹${(
          data.total as number
        ).toLocaleString()}\n\nThank you for shopping with Letitrip!`,
      };

    case "shipping_update":
      return {
        html: getShippingUpdateTemplate({
          customerName: data.customerName as string,
          orderNumber: data.orderNumber as string,
          trackingNumber: data.trackingNumber as string,
          carrier: data.carrier as string,
          estimatedDelivery: data.estimatedDelivery as string,
          trackingUrl: data.trackingUrl as string,
        }),
        text: `Shipping Update\n\nHi ${data.customerName},\n\nYour order #${data.orderNumber} has been shipped.\n\nTracking: ${data.trackingNumber}\nCarrier: ${data.carrier}\n\nTrack here: ${data.trackingUrl}`,
      };

    case "auction_won":
      return {
        html: getAuctionWonTemplate({
          customerName: data.customerName as string,
          itemName: data.itemName as string,
          winningBid: data.winningBid as number,
          auctionEndTime: data.auctionEndTime as string,
          itemUrl: data.itemUrl as string,
        }),
        text: `Congratulations!\n\nHi ${
          data.customerName
        },\n\nYou won the auction for "${data.itemName}" with a bid of ₹${(
          data.winningBid as number
        ).toLocaleString()}!\n\nComplete your purchase: ${data.itemUrl}`,
      };

    case "bid_outbid":
      return {
        html: getBidOutbidTemplate({
          customerName: data.customerName as string,
          itemName: data.itemName as string,
          currentBid: data.currentBid as number,
          yourBid: data.yourBid as number,
          itemUrl: data.itemUrl as string,
        }),
        text: `You've been outbid!\n\nHi ${
          data.customerName
        },\n\nSomeone placed a higher bid on "${
          data.itemName
        }".\n\nYour bid: ₹${(
          data.yourBid as number
        ).toLocaleString()}\nCurrent bid: ₹${(
          data.currentBid as number
        ).toLocaleString()}\n\nPlace a higher bid: ${data.itemUrl}`,
      };

    default:
      throw new Error(`Unknown template type: ${template}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { user } = await getAuthFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SendTemplateEmailRequest = await request.json();

    // Validate required fields
    if (!body.to || !body.template || !body.data) {
      return NextResponse.json(
        { error: "Missing required fields: to, template, data" },
        { status: 400 }
      );
    }

    // Validate template type
    if (!TEMPLATE_SUBJECTS[body.template]) {
      return NextResponse.json(
        { error: `Invalid template type: ${body.template}` },
        { status: 400 }
      );
    }

    // Generate email content from template
    const { html, text } = generateEmailContent(body.template, body.data);
    const subject = TEMPLATE_SUBJECTS[body.template];

    // Send email using backend email service
    const result = await emailService.send({
      to: body.to,
      subject,
      html,
      text,
      replyTo: body.replyTo,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send email",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: "Email sent successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send email";
    console.error("Send email API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
