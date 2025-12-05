/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/email/test/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Test Email Endpoint
 * POST /api/admin/email/test
 *
 * Send a test email to verify Resend configuration
 */

import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/app/api/lib/email/email.service";

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
    const { to } = await request.json();

    if (!to || typeof to !== "string") {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 },
      );
    }

    // Send test email
    const result = await emailService.send({
      to,
      /** Subject */
      subject: "Test Email from Letitrip - Resend Integration",
      /** Html */
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">✅ Test Email</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Email Configuration Test</h2>
    
    <p style="font-size: 16px;">Congratulations! Your Resend email integration is working correctly. 🎉</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="font-size: 14px; margin: 5px 0;"><strong>Service:</strong> Resend</p>
      <p style="font-size: 14px; margin: 5px 0;"><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
      <p style="font-size: 14px; margin: 5px 0;"><strong>Status:</strong> ✅ Delivered</p>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      This test email confirms that your application can successfully send emails through Resend.
    </p>
    
    <p style="font-size: 14px; color: #666;">
      You can now use the email service for:
    </p>
    
    <ul style="font-size: 14px; line-height: 2;">
      <li>✉️ User registration & verification</li>
      <li>🔐 Password reset</li>
      <li>📦 Order confirmations</li>
      <li>🚚 Shipping updates</li>
      <li>⚡ Auction notifications</li>
      <li>💰 Payment confirmations</li>
    </ul>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} Letitrip. All rights reserved.<br>
      India's Premium Auction & Marketplace Platform
    </p>
  </div>
</body>
</html>
      `,
      /** Text */
      text: `Test Email - Resend Integration\n\nCongratulations! Your Resend email integration is working correctly.\n\nSent at: ${new Date().toLocaleString()}\nStatus: Delivered\n\nThis test email confirms that your application can successfully send emails through Resend.`,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: result.error || "Failed to send email",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Test email sent successfully",
      /** Message Id */
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to send test email",
      },
      { status: 500 },
    );
  }
}
