/**
 * Email Service using Resend
 *
 * Handles all email sending functionality for the application
 */

import { Resend } from "resend";
import { serverLogger } from "@/lib/server-logger";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@letitrip.in";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Letitrip";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Letitrip";
const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${SITE_URL}/auth/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Verify your ${SITE_NAME} email address`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Verify Your Email</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello,</p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Thank you for creating a ${SITE_NAME} account! To get started, please verify your email address by clicking the button below:
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verificationLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="color: #667eea; font-size: 14px; word-break: break-all; margin: 10px 0;">
                        ${verificationLink}
                      </p>
                      
                      <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 30px 0 0;">
                        This verification link will expire in 24 hours for security reasons.
                      </p>
                      
                      <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 20px 0 0;">
                        If you didn't create a ${SITE_NAME} account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0;">
                        © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Hello,

Thank you for creating a ${SITE_NAME} account! To get started, please verify your email address by clicking the link below:

${verificationLink}

This verification link will expire in 24 hours for security reasons.

If you didn't create a ${SITE_NAME} account, you can safely ignore this email.

© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
      `.trim(),
    });

    if (error) {
      serverLogger.error("Failed to send verification email", { error });
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    serverLogger.error("Error sending verification email", { error });
    throw error;
  }
}

/**
 * Send email verification email using a pre-built full Firebase link
 * Use this when the full action link is generated by Firebase Admin SDK
 * (auth.generateEmailVerificationLink)
 */
export async function sendVerificationEmailWithLink(
  email: string,
  verificationLink: string,
): ReturnType<typeof sendVerificationEmail> {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Verify your ${SITE_NAME} email address`,
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address. This link expires in 24 hours.</p>`,
      text: `Verify your email: ${verificationLink}\n\nThis link expires in 24 hours.`,
    });

    if (error) {
      serverLogger.error("Failed to send verification email (link)", { error });
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    serverLogger.error("Error sending verification email (link)", { error });
    throw error;
  }
}

/**
 * Send password reset email using a pre-built full Firebase link
 * Use this when the full action link is generated by Firebase Admin SDK
 * (auth.generatePasswordResetLink)
 */
export async function sendPasswordResetEmailWithLink(
  email: string,
  resetLink: string,
): ReturnType<typeof sendPasswordResetEmail> {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Reset your ${SITE_NAME} password`,
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p><p>If you didn't request this, you can safely ignore this email.</p>`,
      text: `Reset your password: ${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
    });

    if (error) {
      serverLogger.error("Failed to send password reset email (link)", {
        error,
      });
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    serverLogger.error("Error sending password reset email (link)", { error });
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${SITE_URL}/auth/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Reset your ${SITE_NAME} password`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Reset Your Password</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello,</p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        We received a request to reset your password for your ${SITE_NAME} account. Click the button below to create a new password:
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="color: #f5576c; font-size: 14px; word-break: break-all; margin: 10px 0;">
                        ${resetLink}
                      </p>
                      
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">
                          <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour for security reasons.
                        </p>
                      </div>
                      
                      <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 20px 0 0;">
                        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                      </p>
                      
                      <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 20px 0 0;">
                        For security reasons, we recommend choosing a strong password that you haven't used before.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0;">
                        © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
                      </p>
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 10px 0 0;">
                        This is an automated email. Please do not reply to this message.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Hello,

We received a request to reset your password for your ${SITE_NAME} account. Click the link below to create a new password:

${resetLink}

⚠️ Important: This password reset link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

For security reasons, we recommend choosing a strong password that you haven't used before.

© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
      `.trim(),
    });

    if (error) {
      serverLogger.error("Failed to send password reset email", { error });
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    serverLogger.error("Error sending password reset email", { error });
    throw error;
  }
}

/**
 * Send password change notification email
 */
export async function sendPasswordChangedEmail(email: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Your ${SITE_NAME} password has been changed`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Password Changed</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello,</p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        This is a confirmation that the password for your ${SITE_NAME} account has been successfully changed.
                      </p>
                      
                      <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #155724; font-size: 14px; line-height: 1.6; margin: 0;">
                          <strong>✓ Confirmed:</strong> Your password was changed on ${new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}.
                        </p>
                      </div>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        If you made this change, you can safely ignore this email.
                      </p>
                      
                      <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #721c24; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                          <strong>⚠️ Didn't make this change?</strong>
                        </p>
                        <p style="color: #721c24; font-size: 14px; line-height: 1.6; margin: 0;">
                          If you didn't change your password, someone else may have accessed your account. Please reset your password immediately and contact our support team.
                        </p>
                      </div>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${SITE_URL}/auth/forgot-password" style="display: inline-block; padding: 14px 40px; background: #dc3545; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                              Reset Password Now
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0;">
                        © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Hello,

This is a confirmation that the password for your ${SITE_NAME} account has been successfully changed on ${new Date().toLocaleString()}.

If you made this change, you can safely ignore this email.

⚠️ Didn't make this change?
If you didn't change your password, someone else may have accessed your account. Please reset your password immediately at:
${SITE_URL}/auth/forgot-password

© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
      `.trim(),
    });

    if (error) {
      serverLogger.error("Failed to send password changed email", { error });
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    serverLogger.error("Error sending password changed email", { error });
    throw error;
  }
}

/**
 * Send order confirmation email
 */
export interface OrderConfirmationEmailParams {
  to: string;
  userName: string;
  orderId: string;
  productTitle: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  shippingAddress: string;
  paymentMethod: string;
}

export async function sendOrderConfirmationEmail(
  params: OrderConfirmationEmailParams,
) {
  const {
    to,
    userName,
    orderId,
    productTitle,
    quantity,
    totalPrice,
    currency,
    shippingAddress,
    paymentMethod,
  } = params;

  const orderUrl = `${SITE_URL}/user/orders/view/${orderId}`;
  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(totalPrice);

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: `Order Confirmed — ${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
                      <p style="font-size: 48px; margin: 0 0 12px;">✅</p>
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Order Confirmed!</h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hi ${userName},</p>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                        Thank you for your order! We've received it and will process it shortly.
                      </p>

                      <!-- Order Details -->
                      <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 24px;">
                        <tr>
                          <td style="color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e9ecef;" colspan="2">Order Details</td>
                        </tr>
                        <tr>
                          <td style="color: #666; font-size: 14px; width: 40%;">Order ID</td>
                          <td style="color: #333; font-size: 14px; font-weight: 600;">${orderId}</td>
                        </tr>
                        <tr>
                          <td style="color: #666; font-size: 14px;">Product</td>
                          <td style="color: #333; font-size: 14px;">${productTitle}</td>
                        </tr>
                        <tr>
                          <td style="color: #666; font-size: 14px;">Quantity</td>
                          <td style="color: #333; font-size: 14px;">${quantity}</td>
                        </tr>
                        <tr>
                          <td style="color: #666; font-size: 14px;">Total</td>
                          <td style="color: #333; font-size: 14px; font-weight: 700;">${formattedTotal}</td>
                        </tr>
                        <tr>
                          <td style="color: #666; font-size: 14px;">Payment</td>
                          <td style="color: #333; font-size: 14px;">${paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</td>
                        </tr>
                        <tr>
                          <td style="color: #666; font-size: 14px; vertical-align: top;">Ship to</td>
                          <td style="color: #333; font-size: 14px;">${shippingAddress}</td>
                        </tr>
                      </table>

                      <!-- CTA -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${orderUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                              View Order
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">
                        We'll send you another email when your order is shipped.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #eee;">
                      <p style="color: #999; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Hi ${userName},\n\nYour order ${orderId} has been confirmed!\n\nProduct: ${productTitle}\nQuantity: ${quantity}\nTotal: ${formattedTotal}\nPayment: ${paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}\nShip to: ${shippingAddress}\n\nView your order: ${orderUrl}\n\n© ${new Date().getFullYear()} ${SITE_NAME}`,
    });

    if (error) {
      serverLogger.error("Failed to send order confirmation email", { error });
      // Don't throw — email failure should not break checkout
    }

    return { success: !error, data };
  } catch (error) {
    serverLogger.error("Error sending order confirmation email", { error });
    // Don't rethrow — email failure should not break checkout
    return { success: false };
  }
}

/**
 * Send contact form message to support
 */
export async function sendContactEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const { name, email, subject, message } = params;
  const supportEmail = process.env.EMAIL_SUPPORT || "info@letitrip.in";

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: supportEmail,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Contact Form</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 40px 0;">
          <table width="600" style="margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <tr><td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">New Contact Message</h1>
            </td></tr>
            <tr><td style="padding: 32px;">
              <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">
              <p style="white-space: pre-wrap;">${message}</p>
            </td></tr>
            <tr><td style="background: #f9f9f9; padding: 16px; text-align: center; color: #888; font-size: 12px;">
              © ${new Date().getFullYear()} ${SITE_NAME}
            </td></tr>
          </table>
        </body>
        </html>
      `,
      text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
    });

    if (error) {
      serverLogger.error("Failed to send contact email", { error });
    }

    return { success: !error, data };
  } catch (error) {
    serverLogger.error("Error sending contact email", { error });
    return { success: false };
  }
}

/**
 * Send admin notification email when a seller submits a new product for review.
 *
 * @param adminEmail   - Recipient admin email address
 * @param product      - The newly-created product data
 */
export async function sendNewProductSubmittedEmail(
  adminEmail: string,
  product: {
    id: string;
    title: string;
    sellerName: string;
    sellerEmail: string;
    category?: string;
  },
) {
  const reviewUrl = `${SITE_URL}/admin/products`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: adminEmail,
      subject: `New Product Submitted — ${product.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Product Submitted</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px; text-align: center;">
                      <p style="font-size: 48px; margin: 0 0 12px;">📦</p>
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Product Submitted</h1>
                      <p style="color: #c7d2fe; margin: 8px 0 0; font-size: 14px;">Action required — review and publish</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        A new product has been submitted to <strong>${SITE_NAME}</strong> and is awaiting your review.
                      </p>

                      <!-- Product details -->
                      <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background: #f8f9fa; border-radius: 8px; margin: 0 0 24px;">
                        <tr>
                          <td style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; width: 40%;">Product ID</td>
                          <td style="color: #111827; font-size: 14px; font-family: monospace;">${product.id}</td>
                        </tr>
                        <tr>
                          <td style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Title</td>
                          <td style="color: #111827; font-size: 14px; font-weight: 600;">${product.title}</td>
                        </tr>
                        ${
                          product.category
                            ? `
                        <tr>
                          <td style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Category</td>
                          <td style="color: #111827; font-size: 14px;">${product.category}</td>
                        </tr>
                        `
                            : ""
                        }
                        <tr>
                          <td style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Seller</td>
                          <td style="color: #111827; font-size: 14px;">${product.sellerName} (${product.sellerEmail})</td>
                        </tr>
                      </table>

                      <!-- CTA -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                        <tr>
                          <td align="center">
                            <a href="${reviewUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;">
                              Review in Admin Panel
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                        You can publish or reject this product from the
                        <a href="${reviewUrl}" style="color: #6366f1; text-decoration: none;">${SITE_NAME} admin panel</a>.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} ${SITE_NAME}. This is an automated notification — do not reply.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `New Product Submitted\n\nProduct: ${product.title} (${product.id})\nSeller: ${product.sellerName} (${product.sellerEmail})\n\nReview at: ${reviewUrl}`,
    });

    if (error) {
      serverLogger.error("Failed to send new product notification email", {
        error,
        productId: product.id,
      });
    }

    return { success: !error, data };
  } catch (error) {
    serverLogger.error("Error sending new product notification email", {
      error,
      productId: product.id,
    });
    return { success: false };
  }
}

/**
 * Send notification email when a new review is submitted on a product.
 * Fires to the product's seller and to the admin inbox.
 */
export async function sendNewReviewNotificationEmail(params: {
  sellerEmail: string;
  adminEmail: string;
  reviewerName: string;
  productTitle: string;
  productId: string;
  rating: number;
  comment: string;
}) {
  const {
    sellerEmail,
    adminEmail,
    reviewerName,
    productTitle,
    productId,
    rating,
    comment,
  } = params;

  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const reviewUrl = `${SITE_URL}/admin/reviews`;
  const recipients = [...new Set([sellerEmail, adminEmail])]; // deduplicate if same

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: recipients,
      subject: `New review on "${productTitle}" — ${rating}/5 stars`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
        <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:40px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:40px;text-align:center;">
                    <p style="font-size:48px;margin:0 0 12px;">⭐</p>
                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;">New Review Submitted</h1>
                    <p style="color:#fef3c7;margin:8px 0 0;font-size:14px;">Pending moderation — review and approve</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px;">
                      <strong>${reviewerName}</strong> has left a new review on <strong>${productTitle}</strong>.
                    </p>
                    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background:#f8f9fa;border-radius:8px;margin:0 0 24px;">
                      <tr>
                        <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;width:40%;">Product</td>
                        <td style="color:#111827;font-size:14px;font-weight:600;">${productTitle}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Product ID</td>
                        <td style="color:#111827;font-size:14px;font-family:monospace;">${productId}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Rating</td>
                        <td style="color:#f59e0b;font-size:18px;">${stars} (${rating}/5)</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Reviewer</td>
                        <td style="color:#111827;font-size:14px;">${reviewerName}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Comment</td>
                        <td style="color:#111827;font-size:14px;line-height:1.6;">${comment.slice(0, 300)}${comment.length > 300 ? "…" : ""}</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                      <tr><td align="center">
                        <a href="${reviewUrl}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:600;">
                          Review in Admin Panel
                        </a>
                      </td></tr>
                    </table>
                    <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0;">This review is pending moderation and is not yet publicly visible.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#f8f9fa;padding:24px;text-align:center;border-top:1px solid #eeeeee;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} ${SITE_NAME}. Automated notification — do not reply.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      text: `New review on "${productTitle}"\n\nRating: ${rating}/5\nReviewer: ${reviewerName}\n\nComment:\n${comment}\n\nReview at: ${reviewUrl}`,
    });

    if (error) {
      serverLogger.error("Failed to send review notification email", {
        error,
        productId,
      });
    }

    return { success: !error, data };
  } catch (error) {
    serverLogger.error("Error sending review notification email", {
      error,
      productId,
    });
    return { success: false };
  }
}

/**
 * Send notification email to all admin addresses when site settings are changed.
 */
export async function sendSiteSettingsChangedEmail(params: {
  adminEmails: string[];
  changedByEmail: string;
  changedFields: string[];
}) {
  const { adminEmails, changedByEmail, changedFields } = params;

  if (adminEmails.length === 0) return { success: false };

  const settingsUrl = `${SITE_URL}/admin/site-settings`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: adminEmails,
      subject: `Site settings updated by ${changedByEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
        <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:40px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px;text-align:center;">
                    <p style="font-size:48px;margin:0 0 12px;">⚙️</p>
                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;">Site Settings Changed</h1>
                    <p style="color:#d1fae5;margin:8px 0 0;font-size:14px;">${new Date().toUTCString()}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px;">
                      <strong>${changedByEmail}</strong> has updated the following site settings:
                    </p>
                    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background:#f8f9fa;border-radius:8px;margin:0 0 24px;">
                      <tr>
                        <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;">Changed Fields</td>
                        <td style="color:#111827;font-size:14px;">${changedFields.map((f) => `<code style="background:#e5e7eb;padding:2px 6px;border-radius:3px;">${f}</code>`).join("&ensp;")}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;">Changed By</td>
                        <td style="color:#111827;font-size:14px;">${changedByEmail}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;">Timestamp</td>
                        <td style="color:#111827;font-size:14px;">${new Date().toUTCString()}</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                      <tr><td align="center">
                        <a href="${settingsUrl}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:600;">
                          View Settings
                        </a>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#f8f9fa;padding:24px;text-align:center;border-top:1px solid #eeeeee;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} ${SITE_NAME}. Automated notification — do not reply.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      text: `Site settings updated by ${changedByEmail}\n\nChanged fields: ${changedFields.join(", ")}\n\nView at: ${settingsUrl}`,
    });

    if (error) {
      serverLogger.error("Failed to send settings change notification email", {
        error,
      });
    }

    return { success: !error, data };
  } catch (error) {
    serverLogger.error("Error sending settings change notification email", {
      error,
    });
    return { success: false };
  }
}
