/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/email/templates/verification.template
 * @description This file contains functionality related to verification.template
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Email Verification Template
 */

/**
 * Retrieves verification email template
 *
 * @param {string} name - The name
 * @param {string} verificationLink - The verification link
 *
 * @returns {string} The verificationemailtemplate result
 *
 * @example
 * getVerificationEmailTemplate("example", "example");
 */

/**
 * Retrieves verification email template
 *
 * @returns {string} The verificationemailtemplate result
 *
 * @example
 * getVerificationEmailTemplate();
 */

export function getVerificationEmailTemplate(
  /** Name */
  name: string,
  /** Verification Link */
  verificationLink: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Letitrip</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${name}! 👋</h2>
    
    <p style="font-size: 16px;">Thank you for registering with <strong>Letitrip</strong>!</p>
    
    <p style="font-size: 16px;">Please verify your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationLink}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                /** Color */
                color: white; 
                /** Padding */
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                /** Display */
                display: inline-block;">
        Verify Email Address
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #667eea; word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
      ${verificationLink}
    </p>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      <strong>Note:</strong> This link will expire in 24 hours.
    </p>
    
    <p style="font-size: 14px; color: #666;">
      If you didn't create an account with Letitrip, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} Letitrip. All rights reserved.<br>
      India's Premium Auction & Marketplace Platform
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Retrieves verification email text
 */
/**
 * Retrieves verification email text
 *
 * @param {string} name - The name
 * @param {string} verificationLink - The verification link
 *
 * @returns {string} The verificationemailtext result
 *
 * @example
 * getVerificationEmailText("example", "example");
 */

/**
 * Retrieves verification email text
 *
 * @returns {string} The verificationemailtext result
 *
 * @example
 * getVerificationEmailText();
 */

export function getVerificationEmailText(
  /** Name */
  name: string,
  /** Verification Link */
  verificationLink: string,
): string {
  return `Hi ${name},

Thank you for registering with Letitrip!

Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
The Letitrip Team`;
}
