/**
 * Password Reset Template
 */

export function getPasswordResetEmailTemplate(
  name: string,
  resetLink: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Letitrip</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${name}! 🔐</h2>
    
    <p style="font-size: 16px;">We received a request to reset your password.</p>
    
    <p style="font-size: 16px;">Click the button below to reset your password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #667eea; word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
      ${resetLink}
    </p>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      <strong>Note:</strong> This link will expire in 1 hour for security reasons.
    </p>
    
    <p style="font-size: 14px; color: #666;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
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

export function getPasswordResetEmailText(
  name: string,
  resetLink: string
): string {
  return `Hi ${name},

We received a request to reset your password for your Letitrip account.

Click the link below to reset your password:

${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The Letitrip Team`;
}
