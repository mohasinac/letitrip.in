# Epic E021: System Configuration

## Overview

Admin system settings and configuration management for the platform including general settings, payment gateways, shipping options, email configuration, and notifications.

## Scope

- General site settings
- Payment gateway configuration
- Shipping settings
- Email/SMTP configuration
- Notification settings
- Feature flags
- Maintenance mode

## User Roles Involved

- **Admin**: Full settings access
- **Seller**: No access
- **User**: No access
- **Guest**: No access

---

## Features

### F021.1: General Settings

**US021.1.1**: Configure Site Settings (Admin)

```
Fields:
- Site name
- Site description
- Logo (light/dark)
- Favicon
- Contact email
- Contact phone
- Address
- Social media links
- Currency settings
- Timezone
- Date/time format
```

**US021.1.2**: Configure SEO Settings (Admin)

```
Fields:
- Default meta title
- Default meta description
- Google Analytics ID
- Google Tag Manager ID
- Facebook Pixel ID
- Robots.txt content
```

**US021.1.3**: Maintenance Mode (Admin)

```
Fields:
- Enable/disable
- Maintenance message
- Allowed IPs (admin access during maintenance)
- Estimated end time
```

### F021.2: Payment Gateway Settings

**US021.2.1**: Configure Razorpay (Admin)

```
Fields:
- API Key
- API Secret
- Webhook secret
- Test/Live mode toggle
```

**US021.2.2**: Configure PayU (Admin)

```
Fields:
- Merchant Key
- Merchant Salt
- Test/Live mode toggle
```

**US021.2.3**: Configure COD Settings (Admin)

```
Fields:
- Enable/disable
- Minimum order amount
- Maximum order amount
- Excluded pincodes
```

**US021.2.4**: Payment Gateway Priority (Admin)

- Set default gateway
- Enable/disable gateways
- Set order of preference

### F021.3: Shipping Settings

**US021.3.1**: Configure Shipping Zones (Admin)

```
Fields per zone:
- Zone name
- States/pincodes included
- Base shipping rate
- Weight-based rates
- Free shipping threshold
```

**US021.3.2**: Configure Shipping Carriers (Admin)

```
Fields:
- Carrier name
- API credentials
- Tracking URL pattern
- Enabled status
```

**US021.3.3**: General Shipping Settings (Admin)

```
Fields:
- Default shipping method
- Processing time (days)
- Package dimensions defaults
- Weight unit (kg/g)
```

### F021.4: Email Settings

**US021.4.1**: Configure SMTP (Admin)

```
Fields:
- SMTP host
- SMTP port
- Username
- Password
- Encryption (TLS/SSL)
- From email
- From name
```

**US021.4.2**: Configure Email Templates (Admin)

```
Templates:
- Welcome email
- Order confirmation
- Order shipped
- Order delivered
- Password reset
- Auction won
- Bid outbid notification
- Payout processed
```

**US021.4.3**: Test Email Configuration (Admin)

- Send test email
- Verify delivery

### F021.5: Notification Settings

**US021.5.1**: Configure Push Notifications (Admin)

```
Fields:
- Firebase config
- Enable/disable
```

**US021.5.2**: Configure In-App Notifications (Admin)

- Enable/disable notification types
- Set retention period

**US021.5.3**: Configure SMS Notifications (Admin)

```
Fields:
- SMS provider (Twilio, MSG91)
- API credentials
- Enable/disable
- SMS templates
```

### F021.6: Feature Flags

**US021.6.1**: Manage Feature Flags (Admin)

```
Flags:
- Enable auctions
- Enable reviews
- Enable COD
- Enable guest checkout
- Enable wishlist
- Enable blog
- Enable seller registration
- Maintenance mode
```

**US021.6.2**: Toggle Features

- Enable/disable features without deployment
- Set feature rollout percentage (optional)

---

## API Endpoints

| Method | Endpoint                            | Description                | Auth  |
| ------ | ----------------------------------- | -------------------------- | ----- |
| GET    | `/api/admin/settings`               | Get all settings           | Admin |
| PUT    | `/api/admin/settings/general`       | Update general settings    | Admin |
| PUT    | `/api/admin/settings/seo`           | Update SEO settings        | Admin |
| PUT    | `/api/admin/settings/payment`       | Update payment config      | Admin |
| PUT    | `/api/admin/settings/shipping`      | Update shipping config     | Admin |
| PUT    | `/api/admin/settings/email`         | Update email config        | Admin |
| POST   | `/api/admin/settings/email/test`    | Send test email            | Admin |
| PUT    | `/api/admin/settings/notifications` | Update notification config | Admin |
| GET    | `/api/admin/settings/features`      | Get feature flags          | Admin |
| PUT    | `/api/admin/settings/features`      | Update feature flags       | Admin |
| PUT    | `/api/admin/settings/maintenance`   | Toggle maintenance mode    | Admin |

---

## Data Models

### SiteSettings

```typescript
interface SiteSettings {
  general: {
    siteName: string;
    siteDescription: string;
    logoLight: string;
    logoDark: string;
    favicon: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    socialLinks: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      youtube?: string;
    };
    currency: string;
    timezone: string;
    dateFormat: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
  };
  maintenance: {
    enabled: boolean;
    message: string;
    allowedIps: string[];
    estimatedEndTime?: Date;
  };
  updatedAt: Date;
  updatedBy: string;
}
```

### PaymentSettings

```typescript
interface PaymentSettings {
  razorpay: {
    enabled: boolean;
    apiKey: string;
    apiSecret: string; // encrypted
    webhookSecret: string; // encrypted
    testMode: boolean;
  };
  payu: {
    enabled: boolean;
    merchantKey: string;
    merchantSalt: string; // encrypted
    testMode: boolean;
  };
  cod: {
    enabled: boolean;
    minOrderAmount: number;
    maxOrderAmount: number;
    excludedPincodes: string[];
  };
  defaultGateway: "razorpay" | "payu";
}
```

### FeatureFlags

```typescript
interface FeatureFlags {
  auctions: boolean;
  reviews: boolean;
  cod: boolean;
  guestCheckout: boolean;
  wishlist: boolean;
  blog: boolean;
  sellerRegistration: boolean;
  maintenanceMode: boolean;
  updatedAt: Date;
}
```

---

## UI Components

### Admin Pages

| Page                  | Route                           | Description             |
| --------------------- | ------------------------------- | ----------------------- |
| Settings Overview     | `/admin/settings`               | Settings dashboard      |
| General Settings      | `/admin/settings/general`       | Site configuration      |
| Payment Settings      | `/admin/settings/payment`       | Payment gateways        |
| Shipping Settings     | `/admin/settings/shipping`      | Shipping zones/carriers |
| Email Settings        | `/admin/settings/email`         | SMTP and templates      |
| Notification Settings | `/admin/settings/notifications` | Push/SMS config         |
| Feature Flags         | `/admin/settings/features`      | Feature toggles         |

---

## Acceptance Criteria

### AC021.1: General Settings

- [ ] Admin can update site name and description
- [ ] Logo upload works for light and dark themes
- [ ] Contact information is editable
- [ ] Social links are configurable
- [ ] Changes reflect immediately on site

### AC021.2: Payment Settings

- [ ] Admin can configure Razorpay credentials
- [ ] Admin can toggle test/live mode
- [ ] COD can be enabled/disabled
- [ ] COD restrictions work correctly
- [ ] Credentials are stored encrypted

### AC021.3: Email Settings

- [ ] SMTP configuration can be saved
- [ ] Test email can be sent
- [ ] Email templates are customizable
- [ ] Emails are sent correctly after configuration

### AC021.4: Maintenance Mode

- [ ] Admin can enable maintenance mode
- [ ] Maintenance message is displayed to users
- [ ] Admin IPs can still access site
- [ ] Maintenance mode can be disabled

### AC021.5: Feature Flags

- [ ] Features can be toggled on/off
- [ ] Changes take effect immediately
- [ ] Disabled features are hidden from UI

---

## Test Documentation

### Unit Tests

| Test File                                  | Coverage         |
| ------------------------------------------ | ---------------- |
| `src/app/api/admin/settings/route.test.ts` | Settings API     |
| `src/app/admin/settings/page.test.tsx`     | Settings pages   |
| `src/services/settings.service.test.ts`    | Settings service |

### Integration Tests

| Test File                                         | Coverage               |
| ------------------------------------------------- | ---------------------- |
| `TDD/acceptance/E021-settings-acceptance.test.ts` | Full settings workflow |

---

## Dependencies

- E001: User Management (admin authentication)
- E011: Payment System (gateway integration)

---

## Implementation Notes

1. All sensitive credentials must be encrypted at rest
2. Use environment variables for production credentials
3. Implement audit log for settings changes
4. Consider caching settings for performance
5. Validate email configuration before saving
6. Feature flags should be cached and refreshed periodically
