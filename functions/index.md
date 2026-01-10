# functions/ - Firebase Cloud Functions Documentation

## Overview

Backend serverless functions running on Firebase Cloud Functions (Node.js runtime). Handles background tasks, database triggers, webhooks, scheduled jobs, and notifications.

## Project Structure

```
functions/
├── src/
│   ├── index.ts                 # Main entry point, exports all functions
│   ├── config/                  # Configuration files
│   ├── constants/               # Backend constants
│   ├── notifications/           # Notification services
│   │   ├── email/              # Email notifications
│   │   ├── whatsapp/           # WhatsApp notifications
│   │   └── whatsapp.ts         # WhatsApp service
│   ├── services/               # Shared backend services
│   │   ├── notification.service.ts
│   │   └── README.md
│   ├── shipping/               # Shipping integrations
│   ├── triggers/               # Firestore/Auth/RTDB triggers
│   │   ├── auctionEndHandler.ts
│   │   ├── bidNotification.ts
│   │   ├── imageOptimization.ts
│   │   ├── orderStatusUpdate.ts
│   │   ├── reviewModeration.ts
│   │   └── userActivityLog.ts
│   └── webhooks/               # External service webhooks
│       ├── cashfree.ts
│       ├── payments.ts
│       ├── paypal.ts
│       ├── payu.ts
│       ├── phonepe.ts
│       ├── razorpay.ts
│       └── stripe.ts
├── package.json                # Functions dependencies
├── tsconfig.json              # TypeScript configuration
├── eslint.config.js           # ESLint configuration
└── README.md                  # Functions documentation
```

## Key Files

### index.ts

**Purpose**: Main entry point that exports all Cloud Functions

**Exports**:

- Scheduled functions (cron jobs)
- Firestore triggers (onCreate, onUpdate, onDelete)
- Authentication triggers
- Realtime Database triggers
- HTTP webhooks
- Callable functions

**Example Structure**:

```typescript
// Scheduled Functions
export { processAuctions } from "./triggers/auctionEndHandler";
export { rebuildCategoryTree } from "./triggers/categoryTree";

// Firestore Triggers
export { onBidCreated } from "./triggers/bidNotification";
export { orderStatusUpdate } from "./triggers/orderStatusUpdate";

// Webhooks
export { razorpayWebhook } from "./webhooks/razorpay";
export { paypalWebhook } from "./webhooks/paypal";
```

## Triggers

Cloud Functions that respond to database events.

### auctionEndHandler.ts

**Purpose**: Handle ended auctions and process winners

**Triggers**:

- Scheduled function: Runs every minute to check for ended auctions
- Firestore trigger: On auction status change

**Functions**:

- `checkEndedAuctions()` - Scheduled check for ended auctions
- `processAuction(auctionId)` - Process single ended auction
- Determine auction winner
- Notify winner and seller
- Update auction status
- Create order for winner
- Handle unsold auctions

**Dependencies**:

- Firestore (auctions, bids, orders)
- Email notifications
- WhatsApp notifications

### bidNotification.ts

**Purpose**: Notify users of bidding activity

**Triggers**:

- `onBidCreated` - When new bid is placed

**Notifications Sent**:

- Seller: New bid on their auction
- Previous highest bidder: Outbid notification
- Watchers: Activity on watched auction
- Auction owner: Bid updates

**Notification Channels**:

- Email
- WhatsApp
- In-app notifications (Firestore document)
- Push notifications (FCM)

### imageOptimization.ts

**Purpose**: Optimize uploaded images automatically

**Triggers**:

- `onImageUpload` - When image is uploaded to Storage
- `onImageDelete` - When image is deleted

**Operations**:

- Generate thumbnails (multiple sizes)
- Compress images
- Convert to modern formats (WebP)
- Update Firestore with image URLs
- Clean up on delete

**Image Sizes**:

- Thumbnail: 150x150
- Small: 300x300
- Medium: 600x600
- Large: 1200x1200
- Original: Preserved

### orderStatusUpdate.ts

**Purpose**: Handle order status changes and notifications

**Triggers**:

- `onOrderUpdate` - When order status changes

**Status Transitions**:

- Pending → Processing: Payment confirmed
- Processing → Shipped: Order shipped
- Shipped → Delivered: Order delivered
- Any → Cancelled: Order cancelled
- Any → Refunded: Refund processed

**Actions per Status**:

- Send notification emails
- Send WhatsApp updates
- Update inventory
- Trigger shipping integration
- Update analytics
- Notify seller

### reviewModeration.ts

**Purpose**: Moderate user reviews automatically

**Triggers**:

- `onReviewCreated` - When new review is submitted

**Moderation Actions**:

- Spam detection
- Profanity filtering
- Sentiment analysis
- Flag inappropriate content
- Auto-approve or hold for manual review
- Notify seller of new review
- Update product rating

**Integration**:

- Google Cloud Natural Language API (optional)
- Custom moderation rules
- Admin notification for flagged reviews

### userActivityLog.ts

**Purpose**: Log user activities for analytics and audit

**Triggers**:

- Various Firestore triggers
- Authentication triggers

**Logged Activities**:

- User registration
- Login/logout
- Product views
- Purchases
- Bids placed
- Reviews submitted
- Profile updates
- Security events

**Storage**:

- Firestore collection: `user-activities`
- BigQuery export (optional)
- Analytics events

## Webhooks

HTTP endpoints for external service callbacks.

### razorpay.ts

**Purpose**: Handle Razorpay payment gateway webhooks

**Webhook Events**:

- `payment.authorized` - Payment authorized
- `payment.captured` - Payment captured
- `payment.failed` - Payment failed
- `refund.processed` - Refund completed
- `order.paid` - Order fully paid

**Webhook Security**:

- Signature verification
- IP whitelist (optional)
- Replay attack prevention
- Request logging

**Actions**:

- Update order payment status
- Send confirmation emails
- Trigger order fulfillment
- Handle failures and retries
- Update analytics

### paypal.ts

**Purpose**: Handle PayPal payment webhooks

**Webhook Events**:

- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`
- `CHECKOUT.ORDER.APPROVED`

**Integration**: PayPal REST API

### stripe.ts

**Purpose**: Handle Stripe payment webhooks

**Webhook Events**:

- `payment_intent.succeeded`
- `payment_intent.failed`
- `charge.refunded`
- `checkout.session.completed`

### phonepe.ts

**Purpose**: PhonePe payment gateway webhook

**Events**: Payment status updates

### payu.ts

**Purpose**: PayU payment gateway webhook

**Events**: Payment confirmations

### cashfree.ts

**Purpose**: Cashfree payment gateway webhook

**Events**: Payment and refund updates

### payments.ts

**Purpose**: Generic payment webhook handler

**Functions**:

- Route to specific payment provider
- Unified payment event processing
- Common payment logic
- Error handling

## Notifications

Services for sending notifications to users.

### email/

**Purpose**: Email notification templates and sending

**Features**:

- Transactional email templates
- Bulk email sending
- Email queuing
- Retry logic
- Bounce handling
- Unsubscribe management

**Integration**: Resend API

### whatsapp/ & whatsapp.ts

**Purpose**: WhatsApp Business API integration

**Features**:

- Message templates
- Template parameter substitution
- Message sending
- Delivery status tracking
- Opt-out management

**Message Types**:

- Order confirmations
- Shipping updates
- Payment confirmations
- Auction notifications
- OTP verification
- Promotional messages (with consent)

**Integration**: WhatsApp Business API (via partner)

## Services

Shared backend services used across functions.

### notification.service.ts

**Purpose**: Unified notification service

**Supported Channels**:

- Email (via Resend)
- WhatsApp (via Business API)
- Push notifications (via FCM)
- In-app notifications (Firestore)
- SMS (optional)

**Functions**:

- `sendNotification(userId, type, data)`
- `sendEmail(to, template, data)`
- `sendWhatsApp(phone, template, params)`
- `sendPush(userId, title, body, data)`
- `createInAppNotification(userId, data)`

**Features**:

- Channel preferences (user settings)
- Fallback channels
- Retry logic
- Delivery tracking
- Rate limiting
- Template management

## Shipping

Shipping integration services.

**Purpose**: Integrate with shipping providers

**Providers**:

- Shiprocket
- Delhivery
- Others as configured

**Functions**:

- Create shipment
- Generate AWB
- Track shipment
- Calculate shipping rates
- Handle webhooks

## Configuration

### config/

**Purpose**: Backend configuration files

**Files**:

- Firebase config
- API keys and secrets
- Service URLs
- Feature flags
- Rate limits

**Environment Variables**:

- Loaded from Firebase Functions config
- Deployed via `firebase functions:config:set`

### constants/

**Purpose**: Backend constants

**Files**:

- Firestore batch sizes
- Retry configurations
- Timeout settings
- Status enums
- Error codes

## Scheduled Functions

Functions that run on a schedule (cron jobs).

### processAuctions

**Schedule**: Every minute (`* * * * *`)

**Purpose**: Process ended auctions

**Tasks**:

- Find auctions with endTime < now
- Determine winners
- Create orders
- Send notifications
- Update statuses

### rebuildCategoryTree

**Schedule**: Every hour (`0 * * * *`)

**Purpose**: Rebuild category tree cache

**Tasks**:

- Fetch all categories
- Build hierarchical tree
- Cache in Firestore or Memory
- Update static file (optional)

### dailyAnalytics

**Schedule**: Daily at midnight (`0 0 * * *`)

**Purpose**: Generate daily analytics

**Tasks**:

- Aggregate sales data
- User activity summary
- Revenue reports
- Export to BigQuery (optional)

### cleanupExpiredData

**Schedule**: Daily (`0 2 * * *`)

**Purpose**: Clean up old data

**Tasks**:

- Remove expired sessions
- Delete old logs
- Archive old orders
- Clean temporary files

## Callable Functions

HTTPS callable functions for client-side calls.

**Pattern**:

```typescript
export const myCallableFunction = functions.https.onCall(
  async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in"
      );
    }

    // Process request
    const result = await doSomething(data);

    return result;
  }
);
```

**Common Callable Functions**:

- `initiatePayment` - Start payment process
- `verifyPayment` - Verify payment status
- `placeBid` - Place auction bid
- `sendMessage` - Send message to seller
- `reportItem` - Report inappropriate content

## Error Handling

### Error Logging

- Winston logger for structured logging
- Errors logged to Cloud Logging
- Error aggregation and alerting

### Error Types

```typescript
class FunctionError extends Error {
  constructor(
    public code: string,
    message: string,
    public httpCode: number = 500
  ) {
    super(message);
  }
}
```

### Retry Logic

- Automatic retries for Firestore triggers
- Exponential backoff
- Max retry limits
- Dead letter queue

## Security

### Authentication

- Verify Firebase Auth tokens
- Check user roles and permissions
- Rate limiting by user/IP
- API key validation for webhooks

### Data Validation

- Validate all input data
- Sanitize user inputs
- Type checking with TypeScript
- Schema validation with Zod

### Secrets Management

- Use Firebase Functions secrets
- Environment-specific configs
- Never commit secrets to git
- Rotate secrets regularly

## Testing

### Local Testing

```bash
# Install dependencies
cd functions && npm install

# Serve functions locally
npm run serve

# Shell for testing
firebase functions:shell
```

### Unit Tests

```bash
npm test
```

### Integration Tests

- Test with Firebase emulators
- Mock external services
- Test error scenarios

## Deployment

### Deploy All Functions

```bash
npm run deploy
```

### Deploy Specific Function

```bash
firebase deploy --only functions:functionName
```

### Environment Setup

```bash
firebase functions:config:set service.key="value"
```

## Monitoring

### Cloud Logging

- View logs in Firebase Console
- Filter by function name
- Set up log-based alerts

### Performance Monitoring

- Track function execution time
- Monitor cold starts
- Track error rates
- Memory usage

### Alerts

- Error rate threshold alerts
- Execution time alerts
- Failed function alerts
- Billing alerts

## Cost Optimization

### Reduce Cold Starts

- Use minimum instances (paid)
- Keep functions warm
- Optimize dependencies

### Reduce Execution Time

- Optimize code
- Use connection pooling
- Cache where possible
- Batch operations

### Reduce Invocations

- Combine related operations
- Use batching
- Debounce frequent triggers

## Best Practices

1. **Idempotency**: Functions should be idempotent
2. **Timeouts**: Set appropriate timeouts
3. **Memory**: Right-size memory allocation
4. **Regions**: Deploy to closest region
5. **Dependencies**: Minimize dependencies
6. **Error Handling**: Always handle errors
7. **Logging**: Log important events
8. **Testing**: Test before deploying
9. **Monitoring**: Set up monitoring
10. **Documentation**: Document all functions

## Common Patterns

### Batch Operations

```typescript
const batch = db.batch();
items.forEach((item) => {
  batch.update(ref, data);
});
await batch.commit();
```

### Paginated Queries

```typescript
let query = collection.limit(100);
let snapshot = await query.get();
while (!snapshot.empty) {
  // Process
  query = collection
    .startAfter(snapshot.docs[snapshot.docs.length - 1])
    .limit(100);
  snapshot = await query.get();
}
```

### Rate Limiting

```typescript
const rateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});
```

## Dependencies

**package.json Key Dependencies**:

- `firebase-admin` - Firebase Admin SDK
- `firebase-functions` - Cloud Functions SDK
- `express` - HTTP server (for webhooks)
- `cors` - CORS middleware
- Various payment gateway SDKs

## Environment Variables

**Required**:

- `FIREBASE_CONFIG` - Auto-set by Firebase
- `RESEND_API_KEY` - Email sending
- `WHATSAPP_API_KEY` - WhatsApp integration
- `RAZORPAY_KEY_SECRET` - Payment gateway
- Various other API keys

## Documentation

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- Individual function README files
