# Settings Resource

## Overview

System configuration and settings management for the platform.

## Database Collections

- `settings` - System settings (single document)
- `feature_flags` - Feature toggles
- `email_templates` - Email templates

## API Routes

```
# Admin Routes
/api/admin/settings              - GET       - Get all settings
/api/admin/settings/general      - PUT       - Update general settings
/api/admin/settings/seo          - PUT       - Update SEO settings
/api/admin/settings/payment      - PUT       - Update payment config
/api/admin/settings/shipping     - PUT       - Update shipping config
/api/admin/settings/email        - PUT       - Update email config
/api/admin/settings/email/test   - POST      - Send test email
/api/admin/settings/notifications - PUT      - Update notification config
/api/admin/settings/features     - GET       - Get feature flags
/api/admin/settings/features     - PUT       - Update feature flags
/api/admin/settings/maintenance  - PUT       - Toggle maintenance mode
```

## Components

- `src/app/admin/settings/` - Settings pages
- `src/app/admin/settings/general/` - General settings
- `src/app/admin/settings/payment/` - Payment settings
- `src/app/admin/settings/shipping/` - Shipping settings
- `src/app/admin/settings/email/` - Email settings
- `src/app/admin/settings/notifications/` - Notification settings

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
    apiSecret: string;
    webhookSecret: string;
    testMode: boolean;
  };
  payu: {
    enabled: boolean;
    merchantKey: string;
    merchantSalt: string;
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

## Related Epic

- E021: System Configuration

## Status: 📋 Documentation Complete

- [x] User stories (E021)
- [x] API specifications
- [ ] Test cases
