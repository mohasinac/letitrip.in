/**
 * Notification Service for Firebase Functions
 *
 * Handles sending email notifications for auction events
 * Uses Resend API for email delivery
 *
 * Environment Variables Required:
 * - RESEND_API_KEY: Resend API key
 * - EMAIL_FROM: Sender email address (default: noreply@justforview.in)
 * - EMAIL_FROM_NAME: Sender name (default: JustForView)
 */

import * as functions from "firebase-functions/v1";

interface EmailRecipient {
  email: string;
  name: string;
}

interface AuctionEmailData {
  auctionId: string;
  auctionName: string;
  auctionSlug: string;
  auctionImage?: string;
  finalBid?: number;
  startingBid: number;
  reservePrice?: number;
  seller: EmailRecipient;
  winner?: EmailRecipient;
  bidder?: EmailRecipient;
}

export class NotificationService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private baseUrl: string;

  constructor() {
    const config = functions.config();
    this.apiKey = config.resend?.api_key || process.env.RESEND_API_KEY || "";
    this.fromEmail =
      config.email?.from || process.env.EMAIL_FROM || "noreply@justforview.in";
    this.fromName =
      config.email?.from_name || process.env.EMAIL_FROM_NAME || "JustForView";
    this.baseUrl =
      config.app?.base_url ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://justforview.in";

    if (!this.apiKey) {
      console.warn(
        "⚠️ Resend API key not configured. Email notifications will be logged only.",
      );
    }
  }

  /**
   * Send email via Resend API
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<boolean> {
    // If no API key, log and return success (dev mode)
    if (!this.apiKey) {
      console.log("📧 [EMAIL - DEV MODE]");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("Text:", text);
      console.log("---");
      return true;
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: [to],
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[Notification] Email send failed:", error);
        return false;
      }

      const result = await response.json();
      console.log("[Notification] Email sent successfully:", result.id);
      return true;
    } catch (error) {
      console.error("[Notification] Error sending email:", error);
      return false;
    }
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Generate auction URL
   */
  private getAuctionUrl(slug: string): string {
    return `${this.baseUrl}/auctions/${slug}`;
  }

  /**
   * Notify seller when auction ends with no bids
   */
  async notifySellerNoBids(data: AuctionEmailData): Promise<boolean> {
    const subject = `Your auction "${data.auctionName}" has ended with no bids`;
    const auctionUrl = this.getAuctionUrl(data.auctionSlug);

    const text = `
Hello ${data.seller.name},

Your auction "${data.auctionName}" has ended without receiving any bids.

Auction Details:
- Starting Bid: ${this.formatCurrency(data.startingBid)}
${
  data.reservePrice ?
    `- Reserve Price: ${this.formatCurrency(data.reservePrice)}` :
    ""
}

You can:
- Re-list the item with a lower starting price
- List it as a regular product for immediate sale
- Try again with better images or description

View Auction: ${auctionUrl}

Thank you for using JustForView!

Best regards,
The JustForView Team
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auction Ended - No Bids</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Auction Ended</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${
  data.seller.name
},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Unfortunately, your auction <strong>"${
  data.auctionName
}"</strong> has ended without receiving any bids.
    </p>
    
    ${
  data.auctionImage ?
    `
    <div style="text-align: center; margin: 20px 0;">
      <img src="${data.auctionImage}" alt="${data.auctionName}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    </div>
    ` :
    ""
}
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #667eea;">Auction Details</h3>
      <p style="margin: 10px 0;"><strong>Starting Bid:</strong> ${this.formatCurrency(
    data.startingBid,
  )}</p>
      ${
  data.reservePrice ?
    `<p style="margin: 10px 0;"><strong>Reserve Price:</strong> ${this.formatCurrency(
      data.reservePrice,
    )}</p>` :
    ""
}
    </div>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h4 style="margin-top: 0; color: #92400e;">What you can do next:</h4>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Re-list the item with a lower starting price</li>
        <li>List it as a regular product for immediate sale</li>
        <li>Try again with better images or description</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${auctionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Auction</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Thank you for using JustForView!<br>
      <strong>The JustForView Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JustForView. All rights reserved.</p>
    <p>You're receiving this email because you listed an auction on our platform.</p>
  </div>
</body>
</html>
`;

    return this.sendEmail(data.seller.email, subject, html, text);
  }

  /**
   * Notify seller and bidder when auction ends but reserve not met
   */
  async notifyReserveNotMet(data: AuctionEmailData): Promise<boolean[]> {
    if (!data.bidder || !data.finalBid) {
      console.error("[Notification] Missing bidder or final bid data");
      return [false, false];
    }

    const auctionUrl = this.getAuctionUrl(data.auctionSlug);

    // Email to seller
    const sellerSubject = `Your auction "${data.auctionName}" ended - Reserve price not met`;
    const sellerText = `
Hello ${data.seller.name},

Your auction "${data.auctionName}" has ended, but the reserve price was not met.

Auction Results:
- Highest Bid: ${this.formatCurrency(data.finalBid)}
- Reserve Price: ${this.formatCurrency(data.reservePrice || 0)}
- Highest Bidder: ${data.bidder.name}

The item was not sold because the highest bid did not meet your reserve price.

You can contact the highest bidder to negotiate, or re-list the auction with a lower reserve price.

View Auction: ${auctionUrl}

Best regards,
The JustForView Team
`;

    const sellerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auction Ended - Reserve Not Met</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Auction Ended</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${
  data.seller.name
},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your auction <strong>"${
  data.auctionName
}"</strong> has ended, but the reserve price was not met.
    </p>
    
    ${
  data.auctionImage ?
    `
    <div style="text-align: center; margin: 20px 0;">
      <img src="${data.auctionImage}" alt="${data.auctionName}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    </div>
    ` :
    ""
}
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #667eea;">Auction Results</h3>
      <p style="margin: 10px 0;"><strong>Highest Bid:</strong> <span style="color: #ef4444; font-size: 20px; font-weight: bold;">${this.formatCurrency(
    data.finalBid,
  )}</span></p>
      <p style="margin: 10px 0;"><strong>Reserve Price:</strong> ${this.formatCurrency(
    data.reservePrice || 0,
  )}</p>
      <p style="margin: 10px 0;"><strong>Highest Bidder:</strong> ${
  data.bidder.name
}</p>
    </div>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e;">
        <strong>Item not sold:</strong> The highest bid did not meet your reserve price, so the item was not sold.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${auctionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Auction</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Best regards,<br>
      <strong>The JustForView Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JustForView. All rights reserved.</p>
  </div>
</body>
</html>
`;

    // Email to bidder
    const bidderSubject = `Auction ended: "${data.auctionName}" - Reserve price not met`;
    const bidderText = `
Hello ${data.bidder.name},

Thank you for participating in the auction "${data.auctionName}".

Unfortunately, the auction has ended and your bid did not meet the seller's reserve price.

Your Bid: ${this.formatCurrency(data.finalBid)}
Reserve Price: ${this.formatCurrency(data.reservePrice || 0)}

The item was not sold. You may want to contact the seller to negotiate a deal, or watch for similar items.

View Auction: ${auctionUrl}

Thank you for using JustForView!

Best regards,
The JustForView Team
`;

    const bidderHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auction Ended - Reserve Not Met</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Auction Ended</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${
  data.bidder.name
},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for participating in the auction <strong>"${
  data.auctionName
}"</strong>.
    </p>
    
    ${
  data.auctionImage ?
    `
    <div style="text-align: center; margin: 20px 0;">
      <img src="${data.auctionImage}" alt="${data.auctionName}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    </div>
    ` :
    ""
}
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #667eea;">Auction Results</h3>
      <p style="margin: 10px 0;"><strong>Your Bid:</strong> <span style="font-size: 20px; font-weight: bold;">${this.formatCurrency(
    data.finalBid,
  )}</span></p>
      <p style="margin: 10px 0;"><strong>Reserve Price:</strong> ${this.formatCurrency(
    data.reservePrice || 0,
  )}</p>
    </div>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e;">
        <strong>Reserve not met:</strong> Unfortunately, your bid did not meet the seller's reserve price, so the item was not sold.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${auctionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Auction</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Thank you for using JustForView!<br>
      <strong>The JustForView Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JustForView. All rights reserved.</p>
  </div>
</body>
</html>
`;

    // Send both emails
    const results = await Promise.all([
      this.sendEmail(data.seller.email, sellerSubject, sellerHtml, sellerText),
      this.sendEmail(data.bidder.email, bidderSubject, bidderHtml, bidderText),
    ]);

    return results;
  }

  /**
   * Notify winner and seller when auction ends successfully
   */
  async notifyAuctionWon(data: AuctionEmailData): Promise<boolean[]> {
    if (!data.winner || !data.finalBid) {
      console.error("[Notification] Missing winner or final bid data");
      return [false, false];
    }

    const auctionUrl = this.getAuctionUrl(data.auctionSlug);
    const ordersUrl = `${this.baseUrl}/account/orders`;

    // Email to winner
    const winnerSubject = `🎉 Congratulations! You won "${data.auctionName}"`;
    const winnerText = `
Congratulations ${data.winner.name}!

You have won the auction for "${data.auctionName}"!

Your Winning Bid: ${this.formatCurrency(data.finalBid)}

What's Next:
1. We've created an order for you
2. Complete the payment to proceed
3. The seller will ship the item once payment is confirmed

View Your Order: ${ordersUrl}

Thank you for using JustForView!

Best regards,
The JustForView Team
`;

    const winnerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Congratulations! You Won the Auction</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">You won the auction!</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${
  data.winner.name
},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      🎊 Congratulations! You have won the auction for <strong>"${
  data.auctionName
}"</strong>!
    </p>
    
    ${
  data.auctionImage ?
    `
    <div style="text-align: center; margin: 20px 0;">
      <img src="${data.auctionImage}" alt="${data.auctionName}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
    </div>
    ` :
    ""
}
    
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="color: white; margin: 0; font-size: 14px;">Your Winning Bid</p>
      <p style="color: white; margin: 10px 0; font-size: 36px; font-weight: bold;">${this.formatCurrency(
    data.finalBid,
  )}</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
      <h3 style="margin-top: 0; color: #059669;">📋 What's Next?</h3>
      <ol style="margin: 10px 0; padding-left: 20px; color: #374151;">
        <li style="margin: 10px 0;">We've created an order for you</li>
        <li style="margin: 10px 0;">Complete the payment to proceed</li>
        <li style="margin: 10px 0;">The seller will ship the item once payment is confirmed</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${ordersUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">View Your Order</a>
      <a href="${auctionUrl}" style="display: inline-block; background: #e5e7eb; color: #374151; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Auction</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Thank you for using JustForView!<br>
      <strong>The JustForView Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JustForView. All rights reserved.</p>
  </div>
</body>
</html>
`;

    // Email to seller
    const sellerSubject = `✅ Your auction "${data.auctionName}" has sold!`;
    const sellerText = `
Great news ${data.seller.name}!

Your auction "${data.auctionName}" has ended successfully!

Sale Details:
- Winner: ${data.winner.name}
- Final Bid: ${this.formatCurrency(data.finalBid)}

An order has been created automatically. Once the buyer completes payment, you'll receive a notification to ship the item.

View Auction: ${auctionUrl}

Thank you for using JustForView!

Best regards,
The JustForView Team
`;

    const sellerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Auction Has Sold!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">✅ Auction Sold!</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Great news ${
  data.seller.name
}!</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your auction <strong>"${
  data.auctionName
}"</strong> has ended successfully!
    </p>
    
    ${
  data.auctionImage ?
    `
    <div style="text-align: center; margin: 20px 0;">
      <img src="${data.auctionImage}" alt="${data.auctionName}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
    </div>
    ` :
    ""
}
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #059669;">Sale Details</h3>
      <p style="margin: 10px 0;"><strong>Winner:</strong> ${
  data.winner.name
}</p>
      <p style="margin: 10px 0;"><strong>Final Bid:</strong> <span style="color: #10b981; font-size: 24px; font-weight: bold;">${this.formatCurrency(
    data.finalBid,
  )}</span></p>
    </div>
    
    <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46;">
        <strong>Next Steps:</strong> An order has been created automatically. Once the buyer completes payment, you'll receive a notification to ship the item.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${auctionUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Auction</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Thank you for using JustForView!<br>
      <strong>The JustForView Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JustForView. All rights reserved.</p>
  </div>
</body>
</html>
`;

    // Send both emails
    const results = await Promise.all([
      this.sendEmail(data.winner.email, winnerSubject, winnerHtml, winnerText),
      this.sendEmail(data.seller.email, sellerSubject, sellerHtml, sellerText),
    ]);

    return results;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
