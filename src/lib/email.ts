/**
 * Email Service using Resend
 * 
 * Handles all email sending functionality for the application
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@letitrip.in';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Letitrip';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Letitrip';
const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

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
      console.error('Failed to send verification email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
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
      console.error('Failed to send password reset email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
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
                          <strong>✓ Confirmed:</strong> Your password was changed on ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}.
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
      console.error('Failed to send password changed email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password changed email:', error);
    throw error;
  }
}
