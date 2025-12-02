/**
 * Auction-related Email Templates
 */

interface AuctionWonData {
  customerName: string;
  itemName: string;
  winningBid: number;
  auctionEndTime: string;
  itemUrl: string;
}

interface BidOutbidData {
  customerName: string;
  itemName: string;
  currentBid: number;
  yourBid: number;
  itemUrl: string;
}

export function getAuctionWonTemplate(data: AuctionWonData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations! You Won!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Congratulations! You Won! 🏆</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${data.customerName}! 🎉</h2>
    
    <p style="font-size: 16px;">You've won the auction for:</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f5576c;">
      <h3 style="margin: 0 0 10px 0; color: #333;">${data.itemName}</h3>
      <p style="font-size: 24px; font-weight: bold; color: #f5576c; margin: 10px 0;">₹${data.winningBid.toLocaleString()}</p>
      <p style="font-size: 14px; color: #666; margin: 5px 0;">Auction ended: ${data.auctionEndTime}</p>
    </div>
    
    <p style="font-size: 16px;">Complete your purchase to claim your item.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.itemUrl}" 
         style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;">
        Complete Purchase
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>Note:</strong> Please complete your payment within 48 hours to avoid order cancellation.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} Letitrip. All rights reserved.<br>
      Questions? Contact us at support@Letitrip.in
    </p>
  </div>
</body>
</html>
  `;
}

export function getBidOutbidTemplate(data: BidOutbidData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Been Outbid!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">You've Been Outbid! ⚠️</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${data.customerName}!</h2>
    
    <p style="font-size: 16px;">Someone placed a higher bid on an item you're watching:</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #fa709a;">
      <h3 style="margin: 0 0 10px 0; color: #333;">${data.itemName}</h3>
      <p style="font-size: 14px; color: #666; margin: 5px 0;">Your bid: ₹${data.yourBid.toLocaleString()}</p>
      <p style="font-size: 18px; font-weight: bold; color: #fa709a; margin: 10px 0;">Current bid: ₹${data.currentBid.toLocaleString()}</p>
    </div>
    
    <p style="font-size: 16px;">Place a higher bid to stay in the running!</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.itemUrl}" 
         style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;">
        Place Higher Bid
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} Letitrip. All rights reserved.<br>
      Questions? Contact us at support@Letitrip.in
    </p>
  </div>
</body>
</html>
  `;
}
