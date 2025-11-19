# Auction Notification Service

## Overview

The Notification Service sends email notifications to users when auctions end. It's integrated with Firebase Functions and uses the Resend API for email delivery.

## Features

### 1. No Bids Notification

**Trigger:** Auction ends with zero bids  
**Recipient:** Seller only  
**Content:**

- Auction details (starting bid, reserve price)
- Suggestions for next steps (re-list, lower price, etc.)
- Link to auction page

### 2. Reserve Not Met Notification

**Trigger:** Auction ends but highest bid doesn't meet reserve price  
**Recipients:** Seller and highest bidder  
**Content:**

- **To Seller:** Final bid amount, reserve price, highest bidder name
- **To Bidder:** Their bid amount, reserve price needed
- Both receive link to auction page

### 3. Auction Won Notification

**Trigger:** Auction ends with winner (reserve met or no reserve)  
**Recipients:** Winner and seller  
**Content:**

- **To Winner:** 🎉 Congratulations message, winning bid, order details, payment instructions
- **To Seller:** Sale confirmation, winner name, final bid amount
- Both receive relevant action links

## Setup

### Environment Variables

Add these to Firebase Functions config or environment:

```bash
# Using Firebase CLI
firebase functions:config:set resend.api_key="YOUR_RESEND_API_KEY"
firebase functions:config:set email.from="noreply@justforview.in"
firebase functions:config:set email.from_name="JustForView"
firebase functions:config:set app.base_url="https://justforview.in"
```

Or use `.env` file in functions directory:

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@justforview.in
EMAIL_FROM_NAME=JustForView
NEXT_PUBLIC_BASE_URL=https://justforview.in
```

### Resend API Setup

1. Sign up at [https://resend.com](https://resend.com)
2. Free tier includes: **3,000 emails/month**
3. Get your API key from dashboard
4. Verify your domain (or use `onboarding@resend.dev` for testing)

## Email Templates

All emails include:

- ✅ Beautiful HTML templates with brand colors
- ✅ Plain text fallback
- ✅ Responsive design (mobile-friendly)
- ✅ Product images (if available)
- ✅ Action buttons with clear CTAs
- ✅ Professional branding

### Brand Colors

- Primary: `#667eea` (Purple)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)

## Usage

### In Firebase Functions

```typescript
import { notificationService } from "./services/notification.service";

// After auction closes
await notificationService.notifyAuctionWon({
  auctionId: "auction_123",
  auctionName: "Vintage Camera",
  auctionSlug: "vintage-camera",
  auctionImage: "https://example.com/image.jpg",
  startingBid: 1000,
  finalBid: 5000,
  seller: {
    email: "seller@example.com",
    name: "John Seller",
  },
  winner: {
    email: "winner@example.com",
    name: "Jane Winner",
  },
});
```

## Development Mode

When `RESEND_API_KEY` is not set, the service logs emails to console instead of sending them. This is useful for local development and testing.

```
📧 [EMAIL - DEV MODE]
To: user@example.com
Subject: Congratulations! You won the auction
Text: ...email content...
---
```

## Error Handling

- All notification failures are logged but don't block auction processing
- Errors are caught and logged with context
- Returns boolean success status for monitoring

```typescript
const [winnerNotified, sellerNotified] =
  await notificationService.notifyAuctionWon(data);
if (!winnerNotified) {
  console.error("Failed to notify winner");
}
```

## Testing

### Local Testing (Dev Mode)

```bash
cd functions
npm run serve
```

Emails will be logged to console instead of being sent.

### Production Testing

1. Set up Resend API key
2. Deploy functions: `npm run deploy`
3. Trigger manually via admin panel or wait for cron

### Manual Trigger

Use the `triggerAuctionProcessing` callable function:

```typescript
// From frontend
const trigger = httpsCallable(functions, "triggerAuctionProcessing");
await trigger();
```

## Monitoring

### Logs

```bash
# View all function logs
npm run logs

# Filter for notification logs
firebase functions:log | grep "Notification"
```

### Success Indicators

- `[Notification] Email sent successfully: msg_abc123`
- `[Auction Cron] Notified winner and seller of auction completion`

### Error Indicators

- `[Notification] Email send failed: ...`
- `[Auction Cron] Error notifying users: ...`

## Cost Estimation

**Resend Free Tier:**

- 3,000 emails/month FREE
- That's ~1,500 auctions/month (2 emails per won auction)
- Or ~3,000 auctions with no winner (1 email)

**Typical Usage:**

- Assume 500 auctions/month
- ~50% win → 500 emails
- ~30% no bids → 150 emails
- ~20% reserve not met → 200 emails
- **Total: 850 emails/month (well within free tier)**

## Alternative Email Providers

If you need more volume, consider:

### SendGrid

- Free tier: **100 emails/day** (3,000/month)
- Similar API to Resend
- Update notification service with SendGrid API

### AWS SES

- **62,000 emails/month FREE** (with EC2)
- More complex setup
- Best for high volume

### Postmark

- Free tier: **100 emails/month**
- Premium email deliverability
- Great for transactional emails

## Notification Service API

### Methods

#### `notifySellerNoBids(data: AuctionEmailData)`

Notify seller when auction ends with no bids.

#### `notifyReserveNotMet(data: AuctionEmailData)`

Notify both seller and highest bidder when reserve isn't met.  
Returns: `Promise<boolean[]>` - [sellerSuccess, bidderSuccess]

#### `notifyAuctionWon(data: AuctionEmailData)`

Notify winner and seller when auction is successfully won.  
Returns: `Promise<boolean[]>` - [winnerSuccess, sellerSuccess]

### Data Types

```typescript
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

interface EmailRecipient {
  email: string;
  name: string;
}
```

## Customization

### Update Email Templates

Edit `functions/src/services/notification.service.ts`:

1. Modify HTML templates for branding
2. Update text content
3. Change button colors
4. Add/remove sections

### Add New Notification Types

```typescript
// Add new method to NotificationService class
async notifyBidPlaced(data: BidEmailData): Promise<boolean> {
  // Your notification logic
}
```

## Troubleshooting

### Emails Not Sending

1. **Check API Key:**

   ```bash
   firebase functions:config:get resend.api_key
   ```

2. **Verify Domain:**

   - Log in to Resend dashboard
   - Ensure domain is verified
   - Or use `onboarding@resend.dev` for testing

3. **Check Logs:**
   ```bash
   npm run logs | grep "Notification"
   ```

### Emails in Spam

- Verify your sending domain in Resend
- Add SPF/DKIM records to DNS
- Warm up your sending domain gradually
- Use professional email content

### Rate Limiting

Resend free tier limits:

- 3,000 emails/month
- Monitor usage in Resend dashboard
- Upgrade plan if needed

## Future Enhancements

### SMS Notifications

Add Twilio for SMS alerts:

- Winner SMS: "You won! Complete payment"
- Seller SMS: "Your item sold for ₹X"

### Push Notifications

Add Firebase Cloud Messaging:

- Real-time mobile notifications
- In-app notifications

### Slack/Discord Webhooks

Admin notifications for:

- High-value auctions
- Suspicious activity
- System errors

---

**Last Updated:** November 19, 2025  
**Maintained By:** Development Team  
**Related Docs:**

- `functions/README.md` - Main functions documentation
- `docs/sessions/SESSION-PHASE-3-COMPLETE.md` - Implementation summary
