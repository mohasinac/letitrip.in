/**
 * Admin Email Settings Test API Route
 *
 * Test email provider connections
 *
 * @status IMPLEMENTED
 * @task 1.5.5
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { logError } from "@/lib/firebase-error-logger";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

interface TestConnectionRequest {
  provider: "resend" | "sendgrid";
}

// POST - Test email provider connection
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: TestConnectionRequest = await req.json();
    const { provider } = body;

    if (!provider || !["resend", "sendgrid"].includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    // Load settings
    const db = admin.firestore();
    const settingsDoc = await db.collection("settings").doc("email").get();
    const settings = settingsDoc.data();

    if (!settings) {
      return NextResponse.json(
        { error: "Email settings not configured" },
        { status: 400 }
      );
    }

    let testResult: { success: boolean; message: string };

    if (provider === "resend") {
      if (!settings.resendEnabled || !settings.resendApiKey) {
        return NextResponse.json(
          { error: "Resend not configured" },
          { status: 400 }
        );
      }

      testResult = await testResend(
        settings.resendApiKey,
        settings.resendFromEmail,
        settings.resendFromName,
        authResult.user.email
      );
    } else if (provider === "sendgrid") {
      if (!settings.sendgridEnabled || !settings.sendgridApiKey) {
        return NextResponse.json(
          { error: "SendGrid not configured" },
          { status: 400 }
        );
      }

      testResult = await testSendGrid(
        settings.sendgridApiKey,
        settings.sendgridFromEmail,
        settings.sendgridFromName,
        authResult.user.email
      );
    } else {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
    });
  } catch (error) {
    logError(error as Error, {
      component: "AdminEmailSettingsTestAPI.POST",
    });
    return NextResponse.json(
      { error: "Connection test failed", success: false },
      { status: 500 }
    );
  }
}

async function testResend(
  apiKey: string,
  fromEmail: string,
  fromName: string,
  toEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    const resendModule = (await import("resend" as any)) as any;
    const Resend = resendModule.Resend;
    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: toEmail,
      subject: "Test Email - Resend Configuration",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3b82f6;">Test Email Successful!</h2>
            <p>This is a test email from your Resend configuration.</p>
            <p>If you received this email, your Resend email service is working correctly.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #6b7280; font-size: 14px;">Sent from JustForView.in Email Settings</p>
          </body>
        </html>
      `,
    });

    if (result.error) {
      return {
        success: false,
        message: result.error.message || "Resend test failed",
      };
    }

    return {
      success: true,
      message: "Resend connection successful! Test email sent.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Resend test failed",
    };
  }
}

async function testSendGrid(
  apiKey: string,
  fromEmail: string,
  fromName: string,
  toEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    const sgMail = (await import("@sendgrid/mail" as any)) as any;
    sgMail.default.setApiKey(apiKey);

    await sgMail.default.send({
      from: {
        name: fromName,
        email: fromEmail,
      },
      to: toEmail,
      subject: "Test Email - SendGrid Configuration",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">Test Email Successful!</h2>
            <p>This is a test email from your SendGrid configuration.</p>
            <p>If you received this email, your SendGrid email service is working correctly.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #6b7280; font-size: 14px;">Sent from JustForView.in Email Settings</p>
          </body>
        </html>
      `,
    });

    return {
      success: true,
      message: "SendGrid connection successful! Test email sent.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "SendGrid test failed",
    };
  }
}
