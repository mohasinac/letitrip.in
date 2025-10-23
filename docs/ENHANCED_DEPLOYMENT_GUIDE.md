# Enhanced API and Payment Gateway Deployment Guide

This guide covers the deployment of the enhanced JustForView store with separated API, Razorpay payment gateway, Shiprocket shipping integration, and comprehensive coupon system.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Payment Gateway Setup](#payment-gateway-setup)
3. [Shipping Gateway Setup](#shipping-gateway-setup)
4. [Database Schema Updates](#database-schema-updates)
5. [API Deployment](#api-deployment)
6. [Frontend Updates](#frontend-updates)
7. [Testing](#testing)
8. [Production Checklist](#production-checklist)

## Environment Setup

### 1. Copy Environment Variables

```bash
cp .env.example .env.local
```

### 2. Configure Required Environment Variables

#### Firebase (Already configured)

- Keep existing Firebase configuration

#### Razorpay Configuration

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx  # Test key for development
RAZORPAY_KEY_SECRET=your-razorpay-secret-key
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

#### Shiprocket Configuration

```env
SHIPROCKET_EMAIL=your-shiprocket-email
SHIPROCKET_PASSWORD=your-shiprocket-password
SHIPROCKET_CHANNEL_ID=your-channel-id
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1
```

## Payment Gateway Setup

### 1. Razorpay Account Setup

1. **Create Razorpay Account**

   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Sign up for a new account
   - Complete KYC verification

2. **Get API Keys**

   - Navigate to Settings > API Keys
   - Generate Test API Keys for development
   - Copy Key ID and Key Secret

3. **Setup Webhooks**

   - Go to Settings > Webhooks
   - Create new webhook with URL: `https://yourdomain.com/api/payment/razorpay/webhook`
   - Select events:
     - `payment.authorized`
     - `payment.captured`
     - `payment.failed`
     - `order.paid`
     - `refund.created`
     - `refund.processed`
   - Copy webhook secret

4. **Configure Payment Methods**
   - Enable desired payment methods (Cards, UPI, Net Banking, Wallets)
   - Set up payment flow preferences

### 2. Frontend Integration

The Razorpay checkout is already integrated in the checkout page. Ensure the public key is correctly set:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

## Shipping Gateway Setup

### 1. Shiprocket Account Setup

1. **Create Shiprocket Account**

   - Go to [Shiprocket](https://www.shiprocket.in/)
   - Sign up for a business account
   - Complete verification process

2. **Get API Credentials**

   - Login to Shiprocket panel
   - Go to Settings > API
   - Note down your email and generate API password
   - Get Channel ID from Channels section

3. **Setup Pickup Location**

   - Add your warehouse/pickup locations
   - Configure default pickup location
   - Verify addresses

4. **Configure Shipping Settings**
   - Set up courier partners
   - Configure shipping rates
   - Set up packaging preferences

## Database Schema Updates

### 1. Coupon Collection Schema

Create `coupons` collection in Firestore with the following structure:

```javascript
// coupons/{couponId}
{
  id: string,
  code: string,
  name: string,
  description: string,
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo',
  value: number,
  minimumAmount: number,
  maximumAmount: number,
  maxUses: number,
  maxUsesPerUser: number,
  usedCount: number,
  startDate: string,
  endDate: string,
  status: 'active' | 'inactive' | 'expired',
  applicableProducts: string[],
  applicableCategories: string[],
  excludeProducts: string[],
  excludeCategories: string[],
  restrictions: {
    firstTimeOnly: boolean,
    newCustomersOnly: boolean,
    existingCustomersOnly: boolean,
    minQuantity: number,
    maxQuantity: number
  },
  combinable: boolean,
  priority: number,
  createdBy: string,
  createdAt: string,
  updatedAt: string
}
```

### 2. Coupon Usage Collection

Create `coupon_usage` collection:

```javascript
// coupon_usage/{usageId}
{
  id: string,
  couponId: string,
  couponCode: string,
  userId: string,
  orderId: string,
  discountAmount: number,
  usedAt: string
}
```

### 3. Orders Collection Updates

Update existing `orders` collection to include:

```javascript
// Additional fields for orders
{
  // ... existing fields
  couponCode: string,
  discountAmount: number,
  paymentMethod: 'razorpay' | 'cod',
  paymentId: string,
  razorpayOrderId: string,
  shiprocketOrderId: string,
  shiprocketShipmentId: string,
  awbCode: string,
  courierName: string,
  trackingUrl: string,
  shippingStatus: string
}
```

## API Deployment

### 1. Install Dependencies

```bash
npm install
```

The following packages are already added to package.json:

- `lodash` - Utility functions
- `moment` - Date handling
- `uuid` - ID generation
- `crypto` - Cryptographic functions

### 2. Deploy to Vercel

1. **Connect Repository**

   ```bash
   vercel --prod
   ```

2. **Set Environment Variables**

   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add all environment variables from `.env.local`
   - Ensure production values for Razorpay and Shiprocket

3. **Configure Domains**
   - Set up custom domain if needed
   - Update webhook URLs to use production domain

### 3. Deploy to Other Platforms

#### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

#### Netlify

```bash
npm run build
# Deploy dist folder to Netlify
```

## Frontend Updates

### 1. Checkout Page

The enhanced checkout page includes:

- Address selection
- Shipping rate calculation
- Coupon application
- Payment method selection
- Razorpay integration

### 2. Admin Panel

New admin features:

- Coupon management
- Order tracking
- Payment status monitoring

### 3. User Dashboard

Enhanced user features:

- Order tracking
- Coupon usage history
- Payment history

## Testing

### 1. Payment Testing

Use Razorpay test credentials:

- Test Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

### 2. Shipping Testing

Use test pincodes:

- 110001 (Delhi)
- 400001 (Mumbai)
- 560001 (Bangalore)

### 3. Coupon Testing

Create test coupons:

```javascript
{
  code: "TEST10",
  type: "percentage",
  value: 10,
  status: "active"
}
```

## Production Checklist

### 1. Security

- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Validate all webhook signatures
- [ ] Implement rate limiting
- [ ] Sanitize all inputs

### 2. Payment Gateway

- [ ] Switch to live Razorpay keys
- [ ] Update webhook URLs to production
- [ ] Test live payment flow
- [ ] Configure refund settings

### 3. Shipping Gateway

- [ ] Verify Shiprocket production credentials
- [ ] Test shipping rate calculation
- [ ] Verify pickup locations
- [ ] Test order creation flow

### 4. Database

- [ ] Set up Firestore security rules
- [ ] Configure backups
- [ ] Set up monitoring
- [ ] Optimize queries

### 5. API

- [ ] Set up error monitoring (Sentry)
- [ ] Configure logging
- [ ] Set up health checks
- [ ] Configure auto-scaling

### 6. Frontend

- [ ] Configure Google Analytics
- [ ] Set up error boundaries
- [ ] Optimize performance
- [ ] Test responsive design

## Monitoring

### 1. Payment Monitoring

- Monitor payment success rates
- Track failed payments
- Set up alerts for payment issues

### 2. Shipping Monitoring

- Monitor order fulfillment
- Track delivery performance
- Alert for shipping delays

### 3. Coupon Monitoring

- Track coupon usage
- Monitor discount impact
- Alert for coupon abuse

## Support

### 1. Documentation

- API documentation is available at `/api-docs`
- Webhook documentation for integrations
- User guides for admin features

### 2. Troubleshooting

- Check logs for payment failures
- Verify webhook signatures
- Monitor shipping API responses

### 3. Contact

- Technical support for payment issues
- Shipping integration support
- Database optimization help

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Run tests
npm test

# Initialize Firebase
npm run firebase:init
```

## API Endpoints

### Coupons

- `GET /api/coupons` - List coupons (admin)
- `POST /api/coupons` - Create coupon (admin)
- `GET /api/coupons/:id` - Get coupon details
- `PUT /api/coupons/:id` - Update coupon (admin)
- `DELETE /api/coupons/:id` - Delete coupon (admin)
- `POST /api/coupons/validate` - Validate coupon

### Payment

- `POST /api/payment/razorpay/create-order` - Create payment order
- `POST /api/payment/razorpay/verify` - Verify payment
- `POST /api/payment/razorpay/webhook` - Payment webhook

### Shipping

- `POST /api/shipping/shiprocket/rates` - Calculate rates
- `POST /api/shipping/shiprocket/create-order` - Create shipping order
- `GET /api/shipping/shiprocket/track/:awb` - Track shipment
- `POST /api/shipping/shiprocket/serviceability` - Check serviceability

This completes the deployment guide for the enhanced e-commerce platform with separated API, payment gateway, shipping integration, and coupon system.
