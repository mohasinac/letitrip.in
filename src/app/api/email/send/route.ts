/**
 * Send Email API Route
 * POST /api/email/send
 * 
 * Send emails through the email service
 * Called by frontend via emailService (not to be confused with backend emailService)
 */

import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/app/api/lib/email/email.service";
import { verifyAuth } from "@/app/api/lib/auth";

interface SendEmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: SendEmailRequest = await request.json();

    // Validate required fields
    if (!body.to || !body.subject || !body.html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    // Send email using backend email service
    const result = await emailService.send({
      to: body.to,
      subject: body.subject,
      html: body.html,
      text: body.text,
      replyTo: body.replyTo,
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || "Failed to send email" 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    console.error("Send email API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to send email" 
      },
      { status: 500 }
    );
  }
}
