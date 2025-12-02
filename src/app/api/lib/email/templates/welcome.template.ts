/**
 * Welcome Email Template
 */

export function getWelcomeEmailTemplate(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Letitrip!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to Letitrip! 🎉</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${name}! 👋</h2>
    
    <p style="font-size: 16px;">Your email has been verified and your account is now <strong>active</strong>!</p>
    
    <p style="font-size: 16px;">Here's what you can do on Letitrip:</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <ul style="font-size: 14px; line-height: 2;">
        <li>🛍️ Browse thousands of products across multiple categories</li>
        <li>📦 List your own products for sale</li>
        <li>⚡ Participate in exciting auctions</li>
        <li>🏪 Create your own shop and start selling</li>
        <li>⭐ Rate and review products</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://Letitrip.in" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;">
        Start Exploring
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Need help? Check out our <a href="https://Letitrip.in/guide" style="color: #667eea;">User Guide</a> or <a href="https://Letitrip.in/contact" style="color: #667eea;">contact our support team</a>.
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

export function getWelcomeEmailText(name: string): string {
  return `Hi ${name},

Welcome to Letitrip! 🎉

Your email has been verified and your account is now active.

Explore our marketplace:
- Browse thousands of products
- List your own products for sale
- Participate in exciting auctions
- Create your own shop

Get started: https://Letitrip.in

Best regards,
The Letitrip Team`;
}
