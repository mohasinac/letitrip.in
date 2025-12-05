/**
 * @fileoverview TypeScript Module
 * @module src/app/api/email/send/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
/**
 * EmailTemplateType type
 * 
 * @typedef {Object} EmailTemplateType
 * @description Type definition for EmailTemplateType
 */
type EmailTemplateType =
  | "verification"
  | "password_reset"
  | "welcome"
  | "order_confirmation"
  | "shipping_update"
  | "auction_won"
  | "bid_outbid";

/**
 * SendTemplateEmailRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for SendTemplateEmailRequest
 */
interface SendTemplateEmailRequest {
  /** To */
  to: string | string[];
  /** Template */
  template: EmailTemplateType;
  /** Data */
  data: Record<string, unknown>;
  /** Reply To */
  replyTo?: string;
}

// Template subjects
const TEMPLATE_SUBJECTS: Record<EmailTemplateType, string> = {
  /** Verification */
  verification: "Verify your email address - Letitrip",
  password_reset: "Reset your password - Letitrip",
  /** Welcome */
  welcome: "Welcome to Letitrip! 🎉",
  order_confirmation: "Order Confirmed! - Letitrip",
  shipping_update: "Your order is on the way! - Letitrip",
  auction_won: "Congratulations! You won the auction! - Letitrip",
  bid_outbid: "You've been outbid - Letitrip",
};

// Generate email content based on template type
/**
 * Function: Generate Email Content
 */
/**
 * Performs generate email content operation
 *
 * @param {EmailTemplateType} template - The template
 * @param {Record<string, unknown>} data - Data object containing information
 *
 * @returns {string} The emailcontent result
 */

/**
 * Performs generate email content operation
 *
 * @returns {any} The emailcontent result
 */

function generateEmailContent(
  /** Template */
  template: EmailTemplateType,
  /** Data */
  data: Record<string, unknown>
): { html: string; text: string } {
  switch (template) {
    case "verification":
      return {
        /** Html */
        html: getVerificationEmailTemplate(
          data.name as string,
          data.verificationLink as string
        ),
        /** Text */
        text: getVerificationEmailText(
          data.name as string,
          data.verificationLink as string
        ),
      };

    case "password_reset":
      return {
        /** Html */
        html: getPasswordResetEmailTemplate(
          data.name as string,
          data.resetLink as string
        ),
        /** Text */
        text: getPasswordResetEmailText(
          data.name as string,
          data.resetLink as string
        ),
      };

    case "welcome":
      return {
        /** Html */
        html: getWelcomeEmailTemplate(data.name as string),
        /** Text */
        text: getWelcomeEmailText(data.name as string),
      };

    case "order_confirmation":
      return {
        /** Html */
        html: getOrderConfirmationTemplate({
          /** Customer Name */
          customerName: data.customerName as string,
          /** Order Number */
          orderNumber: data.orderNumber as string,
          /** Order Date */
          orderDate: data.orderDate as string,
          /** Items */
          items: data.items as Array<{
            /** Name */
            name: string;
            /** Quantity */
            quantity: number;
            /** Price */
            price: number;
          }>,
          /** Subtotal */
          subtotal: data.subtotal as number,
          /** Shipping */
          shipping: data.shipping as number,
          /** Total */
          total: data.total as number,
          /** Shipping Address */
          shippingAddress: data.shippingAddress as string,
        }),
        /** Text */
        text: `Order Confirmation\n\nHi ${data.customerName},\n\nYour order #${
          data.orderNumber
        } has been confirmed.\n\nTotal: ₹${(
          data.total as number
        ).toLocaleString()}\n\nThank you for shopping with Letitrip!`,
      };

    case "shipping_update":
      return {
        /** Html */
        html: getShippingUpdateTemplate({
          /** Customer Name */
          customerName: data.customerName as string,
          /** Order Number */
          orderNumber: data.orderNumber as string,
          /** Tracking Number */
          trackingNumber: data.trackingNumber as string,
          /** Carrier */
          carrier: data.carrier as string,
          /** Estimated Delivery */
          estimatedDelivery: data.estimatedDelivery as string,
          /** Tracking Url */
          trackingUrl: data.trackingUrl as string,
        }),
        /** Text */
        text: `Shipping Update\n\nHi ${data.customerName},\n\nYour order #${data.orderNumber} has been shipped.\n\nTracking: ${data.trackingNumber}\nCarrier: ${data.carrier}\n\nTrack here: ${data.trackingUrl}`,
      };

    case "auction_won":
      return {
        /** Html */
        html: getAuctionWonTemplate({
          /** Customer Name */
          customerName: data.customerName as string,
          /** Item Name */
          itemName: data.itemName as string,
          /** Winning Bid */
          winningBid: data.winningBid as number,
          /** Auction End Time */
          auctionEndTime: data.auctionEndTime as string,
          /** Item Url */
          itemUrl: data.itemUrl as string,
        }),
        /** Text */
        text: `Congratulations!\n\nHi ${
          data.customerName
        },\n\nYou won the auction for "${data.itemName}" with a bid of ₹${(
          data.winningBid as number
        ).toLocaleString()}!\n\nComplete your purchase: ${data.itemUrl}`,
      };

    case "bid_outbid":
      return {
        /** Html */
        html: getBidOutbidTemplate({
          /** Customer Name */
          customerName: data.customerName as string,
          /** Item Name */
          itemName: data.itemName as string,
          /** Current Bid */
          currentBid: data.currentBid as number,
          /** Your Bid */
          yourBid: data.yourBid as number,
          /** Item Url */
          itemUrl: data.itemUrl as string,
        }),
        /** Text */
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

    /** Default */
    default:
      throw new Error(`Unknown template type: ${template}`);
  }
}

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

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
      /** To */
      to: body.to,
      subject,
      html,
      text,
      /** Reply To */
      replyTo: body.replyTo,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: result.error || "Failed to send email",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message Id */
      messageId: result.messageId,
      /** Message */
      message: "Email sent successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send email";
    console.error("Send email API error:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
