# src/emails - Email Templates Documentation

## Overview

React-based email templates for transactional emails sent to users. Uses inline CSS styling for maximum email client compatibility.

## Email Templates

### Welcome.tsx

**Purpose**: Welcome email sent to new users after registration

**Props Interface**:

```typescript
interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  verificationLink?: string;
}
```

**Sent When**:

- User registers for new account
- Email verification required

**Features**:

- Branded header with logo
- Personalized welcome message
- Email verification link (if applicable)
- Platform features overview
- Getting started tips
- Call-to-action buttons
- Social media links
- Footer with legal links

**Styling**: Inline CSS with responsive design for email clients

**Template Sections**:

1. Header with logo
2. Welcome greeting
3. Verification button (conditional)
4. Platform highlights
5. Quick start guide
6. Support information
7. Footer

### OrderConfirmation.tsx

**Purpose**: Order confirmation email sent after successful purchase

**Props Interface**:

```typescript
interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  orderDate: string;
  orderTotal: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingUrl?: string;
}
```

**Sent When**:

- Order successfully placed
- Payment confirmed

**Features**:

- Order number and date
- Itemized order details with images
- Quantity and pricing for each item
- Subtotal, taxes, shipping
- Total amount
- Shipping address
- Estimated delivery date
- Order tracking link
- Customer support contact

**Template Sections**:

1. Order confirmation header
2. Order summary table
3. Order items list with images
4. Pricing breakdown
5. Shipping information
6. Tracking link
7. Support and returns info

### PasswordReset.tsx

**Purpose**: Password reset email with secure reset link

**Expected Props**:

```typescript
interface PasswordResetEmailProps {
  userName: string;
  resetLink: string;
  expiryTime: string;
}
```

**Sent When**:

- User requests password reset
- Forgot password flow initiated

**Features**:

- Security notice
- Password reset button with secure link
- Link expiration notice
- Security tips
- Alternative contact method
- Warning if user didn't request reset

**Security**:

- Time-limited reset token
- Single-use link
- Secure HTTPS link
- Expiry warning

### ShippingUpdate.tsx

**Purpose**: Shipping status update notifications

**Expected Props**:

```typescript
interface ShippingUpdateEmailProps {
  customerName: string;
  orderId: string;
  status: "shipped" | "in_transit" | "out_for_delivery" | "delivered";
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery?: string;
  carrier: string;
}
```

**Sent When**:

- Order shipped
- Status changes during transit
- Out for delivery
- Delivered

**Features**:

- Current shipping status
- Tracking number
- Carrier information
- Tracking link
- Estimated delivery date
- Order details recap
- Contact support link

### Newsletter.tsx

**Purpose**: Newsletter and promotional email template

**Expected Props**:

```typescript
interface NewsletterEmailProps {
  recipientName: string;
  featuredProducts?: Array<Product>;
  promotions?: Array<Promotion>;
  blogPosts?: Array<BlogPost>;
  unsubscribeLink: string;
}
```

**Sent When**:

- Regular newsletter schedule
- Special promotions
- New product launches
- Blog post notifications

**Features**:

- Featured products section
- Special offers and promotions
- Blog post highlights
- Personalized recommendations
- Unsubscribe link
- Social media links

## Email Design System

### Color Palette

- Primary: #2563eb (Blue)
- Secondary: #10b981 (Green)
- Text: #1f2937 (Dark Gray)
- Background: #f3f4f6 (Light Gray)
- White: #ffffff
- Border: #e5e7eb (Light Border)

### Typography

- Font Family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
- Headings: Bold, 24-32px
- Body: Regular, 14-16px
- Small Text: 12-14px (footer, legal)

### Layout

- Max Width: 600px (standard email width)
- Padding: 20-32px
- Border Radius: 8px for cards
- Responsive: Adapts to mobile email clients

### Components

- **Header**: Logo, brand name
- **Button**: CTA buttons with primary color
- **Card**: Boxed content sections
- **Table**: Order items, pricing
- **Footer**: Legal links, social media, unsubscribe

## Email Sending Integration

### Service Integration

Emails are sent via Resend service (see `src/services/emailService.ts`)

### Sending Function

```typescript
import { render } from "@react-email/render";
import { WelcomeEmail } from "@/emails/Welcome";

const html = render(<WelcomeEmail {...props} />);
await emailService.send({
  to: user.email,
  subject: "Welcome to Letitrip!",
  html: html,
});
```

### Testing

- Use Resend test mode for development
- Preview emails in browser before sending
- Test across email clients (Gmail, Outlook, Apple Mail)

## Email Client Compatibility

### Supported Clients

- Gmail (Web, iOS, Android)
- Apple Mail (macOS, iOS)
- Outlook (Windows, macOS, Web)
- Yahoo Mail
- ProtonMail
- Others (basic HTML support)

### Compatibility Considerations

- **Inline CSS**: All styles inline for maximum compatibility
- **Tables**: Use tables for layout (email clients don't support flexbox/grid)
- **Images**: Provide alt text, handle image blocking
- **Links**: Absolute URLs only
- **Fonts**: Fallback font stack
- **No JavaScript**: Email clients don't execute JS

## Template Structure

### Standard Email Structure

```html
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Subject</title>
  </head>
  <body style="...">
    <div style="max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="...">Logo + Brand</div>

      <!-- Main Content -->
      <div style="...">
        <!-- Content sections -->
      </div>

      <!-- Footer -->
      <div style="...">
        <!-- Legal links, unsubscribe, social -->
      </div>
    </div>
  </body>
</html>
```

### Responsive Design

- Use `@media` queries for mobile adjustments
- Fluid images: `max-width: 100%`
- Stackable columns on mobile
- Touch-friendly buttons (min 44px height)

## Email Content Guidelines

### Subject Lines

- Keep under 50 characters
- Clear and actionable
- Avoid spam trigger words
- Personalize when possible

### Body Content

- Keep concise and scannable
- Use headings and sections
- Highlight important information
- Clear call-to-action
- Professional tone

### Legal Requirements

- Unsubscribe link (for marketing emails)
- Physical address (CAN-SPAM compliance)
- Privacy policy link
- Terms of service link

## Localization

### Internationalization Support

- Templates support multiple languages
- Use i18n keys for text content
- RTL support for Arabic/Hebrew
- Local currency formatting
- Date/time localization

### Language Variables

```typescript
interface EmailI18nProps {
  locale: string; // 'en', 'hi', etc.
  translations: Record<string, string>;
}
```

## Accessibility

### Email Accessibility

- Semantic HTML structure
- Alt text for all images
- Proper heading hierarchy (h1, h2, h3)
- High contrast text
- Clear link text (not "click here")
- Table headers for data tables

## Performance

### Optimization

- Optimize images (compress, appropriate size)
- Minimize HTML size
- Inline critical CSS only
- Remove unused styles
- Reduce HTTP requests

### Loading

- Graceful degradation if images don't load
- Text-based CTAs as fallback
- Alt text for images

## Testing Checklist

### Pre-Send Testing

- [ ] Preview in browser
- [ ] Test all links
- [ ] Verify dynamic content renders correctly
- [ ] Check spelling and grammar
- [ ] Test across email clients
- [ ] Mobile responsiveness
- [ ] Dark mode appearance
- [ ] Spam score check

### Email Client Testing Tools

- Litmus
- Email on Acid
- Mailtrap
- Preview in Gmail, Outlook, Apple Mail

## Metrics & Analytics

### Tracking

- Open rate tracking (tracking pixel)
- Click-through rate (UTM parameters)
- Conversion tracking
- Unsubscribe rate

### UTM Parameters

Add UTM parameters to all links for analytics:

```
?utm_source=email&utm_medium=transactional&utm_campaign=order_confirmation
```

## Common Email Types

### Transactional Emails

- Welcome emails
- Order confirmations
- Shipping updates
- Password resets
- Email verification
- Invoice emails
- Account notifications

### Marketing Emails

- Newsletters
- Promotional campaigns
- Product announcements
- Cart abandonment
- Reactivation emails
- Feedback requests

## File Organization

```
src/emails/
├── Welcome.tsx              # Welcome email
├── OrderConfirmation.tsx    # Order confirmation
├── PasswordReset.tsx        # Password reset
├── ShippingUpdate.tsx       # Shipping updates
├── Newsletter.tsx           # Newsletter template
├── components/              # Reusable email components (could add)
│   ├── EmailButton.tsx
│   ├── EmailHeader.tsx
│   └── EmailFooter.tsx
└── utils/                   # Email utilities (could add)
    └── formatters.ts
```

## Maintenance

### Regular Tasks

- Update branding as needed
- Refresh promotional content
- Test new email clients
- Update legal links
- Monitor deliverability
- Review spam complaints

### Version Control

- Track template changes in git
- Test before deploying updates
- A/B test new versions
- Maintain changelog

## Future Enhancements

See [comments.md](./comments.md) for detailed refactoring notes.
