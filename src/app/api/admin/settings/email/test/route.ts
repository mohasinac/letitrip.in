/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/settings/email/test/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * TestConnectionRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for TestConnectionRequest
 */
interface TestConnectionRequest {
  /** Provider */
  provider: "resend" | "sendgrid";
}

// POST - Test email provider connection
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

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
      /** Success */
      success: testResult.success,
      /** Message */
      message: testResult.message,
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "AdminEmailSettingsTestAPI.POST",
    });
    return NextResponse.json(
      { error: "Connection test failed", success: false },
      { status: 500 }
    );
  }
}

/**
 * Function: Test Resend
 */
/**
 * Performs test resend operation
 *
 * @returns {Promise<any>} Promise resolving to testresend result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Performs test resend operation
 *
 * @returns {Promise<any>} Promise resolving to testresend result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function testResend(
  /** Api Key */
  apiKey: string,
  /** From Email */
  fromEmail: string,
  /** From Name */
  fromName: string,
  /** To Email */
  toEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    /**
     * Performs resend module operation
     *
     * @returns {any} The resendmodule result
     */

    /**
     * Performs resend module operation
     *
     * @returns {any} The resendmodule result
     */

    const resendModule = (await import("resend" as any)) as any;
    const Resend = resendModule.Resend;
    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      /** From */
      from: `${fromName} <${fromEmail}>`,
      /** To */
      to: toEmail,
      /** Subject */
      subject: "Test Email - Resend Configuration",
      /** Html */
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
        /** Success */
        success: false,
        /** Message */
        message: result.error.message || "Resend test failed",
      };
    }

    return {
      /** Success */
      success: true,
      /** Message */
      message: "Resend connection successful! Test email sent.",
    };
  } catch (error) {
    return {
      /** Success */
      success: false,
      /** Message */
      message: error instanceof Error ? error.message : "Resend test failed",
    };
  }
}

/**
 * Function: Test Send Grid
 */
/**
 * Performs test send grid operation
 *
 * @returns {Promise<any>} Promise resolving to testsendgrid result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Performs test send grid operation
 *
 * @returns {Promise<any>} Promise resolving to testsendgrid result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function testSendGrid(
  /** Api Key */
  apiKey: string,
  /** From Email */
  fromEmail: string,
  /** From Name */
  fromName: string,
  /** To Email */
  toEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    /**
     * Performs sg mail operation
     *
     * @returns {any} The sgmail result
     */

    /**
     * Performs sg mail operation
     *
     * @returns {any} The sgmail result
     */

    const sgMail = (await import("@sendgrid/mail" as any)) as any;
    sgMail.default.setApiKey(apiKey);

    await sgMail.default.send({
      /** From */
      from: {
        /** Name */
        name: fromName,
        /** Email */
        email: fromEmail,
      },
      /** To */
      to: toEmail,
      /** Subject */
      subject: "Test Email - SendGrid Configuration",
      /** Html */
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
      /** Success */
      success: true,
      /** Message */
      message: "SendGrid connection successful! Test email sent.",
    };
  } catch (error) {
    return {
      /** Success */
      success: false,
      /** Message */
      message: error instanceof Error ? error.message : "SendGrid test failed",
    };
  }
}
