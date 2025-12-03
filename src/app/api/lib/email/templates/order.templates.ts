/**
 * Order-related Email Templates
 */

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
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

export function getOrderConfirmationTemplate(
  data: OrderConfirmationData,
): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
      </tr>
    `,
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
      <a href="https://Letitrip.in/user/orders/${data.orderNumber}" 
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
      Questions? Contact us at support@Letitrip.in
    </p>
  </div>
</body>
</html>
  `;
}

export function getShippingUpdateTemplate(data: ShippingUpdateData): string {
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
