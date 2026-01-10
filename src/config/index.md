# Configuration Files

This folder contains application configuration files for external services and integrations.

## Configuration Files

### payment-gateways.config.ts

**Purpose:** Payment gateway configuration (Razorpay, Stripe, PayPal, etc.)

**Exports:**

- `razorpayConfig` - Razorpay API keys and settings
- `stripeConfig` - Stripe configuration
- `paypalConfig` - PayPal settings
- `gatewayPriority` - Gateway selection priority
- `gatewayFees` - Fee structure per gateway

**Environment Variables:**

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

---

### shiprocket.config.ts

**Purpose:** Shiprocket shipping API configuration

**Exports:**

- `shiprocketConfig` - API credentials
- `shiprocketEndpoints` - API endpoints
- `defaultShippingSettings` - Default shipping rules

**Environment Variables:**

- `SHIPROCKET_EMAIL`
- `SHIPROCKET_PASSWORD`
- `SHIPROCKET_TOKEN`

---

### whatsapp.config.ts

**Purpose:** WhatsApp Business API configuration

**Exports:**

- `whatsappConfig` - API credentials
- `messageTemplates` - Pre-approved message templates
- `defaultSettings` - Default messaging settings

**Environment Variables:**

- `WHATSAPP_BUSINESS_ID`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`

---

### address-api.config.ts

**Purpose:** Address lookup API configuration (pincode, geocoding)

**Exports:**

- `addressAPIConfig` - API endpoints and keys
- `geocodingConfig` - Geocoding service settings
- `pincodeAPIConfig` - Pincode lookup settings

**Environment Variables:**

- `GOOGLE_MAPS_API_KEY`
- `PINCODE_API_KEY`

---

### cache.config.ts

**Purpose:** Caching configuration (Redis, in-memory)

**Exports:**

- `cacheConfig` - Cache settings
- `cacheTTL` - Time-to-live values for different data types
- `cacheKeys` - Cache key patterns
- `cacheStrategy` - Caching strategies

**Settings:**

```typescript
{
  products: { ttl: 3600 }, // 1 hour
  categories: { ttl: 86400 }, // 24 hours
  user: { ttl: 1800 } // 30 minutes
}
```

---

## Configuration Patterns

### Environment-Based Config

```typescript
export const config = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  apiSecret: process.env.API_SECRET, // server-only
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === "development",
};
```

### Type-Safe Config

```typescript
interface PaymentConfig {
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
  mode: "test" | "live";
}

export const razorpayConfig: PaymentConfig = {
  /* ... */
};
```

### Validation

```typescript
import { z } from "zod";

const configSchema = z.object({
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
});

export const config = configSchema.parse({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
});
```

---

## Environment Variables

### Required Variables

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### Optional Variables

- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `GOOGLE_MAPS_API_KEY`

---

## Best Practices

### Naming

- Use `NEXT_PUBLIC_` prefix for client-side variables
- Use SCREAMING_SNAKE_CASE for env variables
- Use camelCase for exported config objects

### Security

- Never commit `.env` files
- Use `.env.example` for documentation
- Validate all environment variables
- Use secrets management for production

### Organization

- One config file per service/integration
- Group related settings together
- Export typed configuration objects
- Document all configuration options
