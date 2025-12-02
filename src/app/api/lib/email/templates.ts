/**
 * Email Templates for Letitrip
 * 
 * Additional email templates for various user interactions
 */

interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: string;
}

interface ShippingUpdateData {
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  trackingUrl: string;
}

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

export class EmailTemplates {
  /**
   * Order Confirmation Email
   */
  static orderConfirmation(data: OrderConfirmationData): string {
    const itemsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
      </tr>
    `
      )
      .join("");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Order Confirmed! 🎉</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${data.customerName}! 👋</h2>
    
    <p style="font-size: 16px;">Thank you for your order! We're getting it ready to ship.</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="font-size: 14px; margin: 5px 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
      <p style="font-size: 14px; margin: 5px 0;"><strong>Order Date:</strong> ${data.orderDate}</p>
    </div>
    
    <h3 style="color: #333; margin-top: 30px;">Order Summary</h3>
    <table style="width: 100%; background: white; border-radius: 5px; overflow: hidden;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 10px; text-align: left;">Item</th>
          <th style="padding: 10px; text-align: center;">Qty</th>
          <th style="padding: 10px; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
          <td style="padding: 10px; text-align: right;">₹${data.subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
          <td style="padding: 10px; text-align: right;">₹${data.shipping.toLocaleString()}</td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px;">Total:</td>
          <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px;">₹${data.total.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
    
    <h3 style="color: #333; margin-top: 30px;">Shipping Address</h3>
    <div style="background: white; padding: 15px; border-radius: 5px;">
      <p style="font-size: 14px; margin: 0; white-space: pre-line;">${data.shippingAddress}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://letitrip.in/user/orders/${data.orderNumber}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;">
        Track Your Order
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} Letitrip. All rights reserved.<br>
      Questions? Contact us at support@letitrip.in
    </p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Shipping Update Email
   */
  static shippingUpdate(data: ShippingUpdateData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order is On the Way!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Your Order is On the Way! 📦</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${data.customerName}! 👋</h2>
    
    <p style="font-size: 16px;">Great news! Your order has been shipped and is on its way to you.</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="font-size: 14px; margin: 10px 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
      <p style="font-size: 14px; margin: 10px 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      <p style="font-size: 14px; margin: 10px 0;"><strong>Carrier:</strong> ${data.carrier}</p>
      <p style="font-size: 14px; margin: 10px 0;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.trackingUrl}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;">
        Track Your Package
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      You'll receive another email once your order has been delivered.
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

  /**
   * Auction Won Email
   */
  static auctionWon(data: AuctionWonData): string {
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

  /**
   * Bid Outbid Email
   */
  static bidOutbid(data: BidOutbidData): string {
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
}
