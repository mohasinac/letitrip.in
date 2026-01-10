# src/templates - Template Files Documentation

## Overview

Contains template files used across the application, primarily email templates organized for server-side rendering.

## Directory Structure

### email/

Email template files for server-side email generation

**Files:**

- `AuctionBidNotification.tsx` - Auction bid notification email
- `Newsletter.tsx` - Newsletter email template
- `OrderConfirmation.tsx` - Order confirmation email
- `PasswordReset.tsx` - Password reset email
- `ShippingUpdate.tsx` - Shipping update notification
- `WelcomeEmail.tsx` - Welcome email for new users

## Purpose

### Separation from src/emails

- **src/emails/**: React Email components for client-side rendering and development
- **src/templates/email/**: Server-side templates for Firebase Functions and API routes

This separation allows:

1. Different rendering contexts (client vs server)
2. Optimized builds for different environments
3. Sharing templates across frontend and Cloud Functions
4. Independent versioning and deployment

## Email Templates

Templates in this directory are used by:

- Firebase Cloud Functions (functions/src/notifications/)
- API routes (src/app/api/email/)
- Email service (src/services/emailService.ts)

### Template Usage Pattern

```typescript
import { WelcomeEmail } from "@/templates/email/WelcomeEmail";
import { render } from "@react-email/render";

const html = render(
  <WelcomeEmail userName="John Doe" userEmail="john@example.com" />
);

await sendEmail({
  to: user.email,
  subject: "Welcome!",
  html: html,
});
```

## Template Types

### Transactional Templates

- **WelcomeEmail.tsx**: New user welcome
- **OrderConfirmation.tsx**: Purchase confirmation
- **PasswordReset.tsx**: Password reset link
- **ShippingUpdate.tsx**: Order tracking updates
- **AuctionBidNotification.tsx**: Bidding notifications

### Marketing Templates

- **Newsletter.tsx**: Newsletter and promotional content

## Technical Details

### Rendering

Templates use React components that render to HTML strings for email clients.

**Rendering Engine**: @react-email/render or custom renderer

### Styling

- Inline CSS for email client compatibility
- Responsive design with media queries
- Mobile-first approach

### Data Props

Each template accepts typed props interface for type-safe rendering.

Example:

```typescript
interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  verificationLink?: string;
}
```

## Integration Points

### Firebase Functions

Templates used in Cloud Functions for automated emails:

```typescript
// functions/src/notifications/emailNotification.ts
import { OrderConfirmation } from "@/templates/email/OrderConfirmation";
```

### API Routes

Templates used in Next.js API routes:

```typescript
// src/app/api/email/send-welcome/route.ts
import { WelcomeEmail } from "@/templates/email/WelcomeEmail";
```

### Email Service

Central email service uses templates:

```typescript
// src/services/emailService.ts
import templates from "@/templates/email";
```

## Development

### Adding New Template

1. Create new `.tsx` file in `src/templates/email/`
2. Define props interface
3. Implement React component with inline styles
4. Export component
5. Add to index file if needed
6. Document in this file

### Testing Templates

- Preview in browser during development
- Test with different prop combinations
- Verify across email clients
- Check mobile responsiveness

## Related Documentation

- [src/emails/index.md](../emails/index.md) - Client-side email components
- [functions/index.md](../../functions/index.md) - Cloud Functions that use templates
- Email service documentation

## Future Enhancements

See [comments.md](./comments.md) for refactoring notes and improvements.
