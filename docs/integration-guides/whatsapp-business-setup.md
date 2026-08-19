# WhatsApp Business Platform Setup

This guide walks through connecting a real Meta WhatsApp Business Cloud API account so the platform-level WhatsApp notification addon and admin purchase announcements actually deliver. Do these steps outside the codebase, then paste the resulting values into **Site Settings → WhatsApp**.

## 1. Meta Business Manager

Create or verify a Business account at [business.facebook.com](https://business.facebook.com). Complete Business Verification (legal name, address, phone) — most message-template categories require a verified business before they'll be approved.

## 2. WhatsApp Business Platform app

In [developers.facebook.com](https://developers.facebook.com), create an App and add the **WhatsApp** product. This gives you a test phone number for development immediately.

## 3. Register the real business phone number

WhatsApp Manager → Phone Numbers → Add phone number → verify via SMS or voice OTP → complete Display Name review (Meta approves the shown business name before it goes live).

## 4. System User + permanent access token

Business Settings → Users → System Users → create a System User with **Admin** role → assign it the WhatsApp Business Account asset with `whatsapp_business_messaging` + `whatsapp_business_management` permissions → generate a token. System User tokens don't expire the way personal User tokens do, so this is the one to use in production.

- Copy the token into **Site Settings → WhatsApp → Cloud API System User Token**.
- Copy the **Phone Number ID** (WhatsApp Manager → API Setup) into **Site Settings → WhatsApp → Phone Number ID**.

## 5. Message Templates (required for the order-updates addon)

Meta's Cloud API only allows free-form text messages within a 24-hour window after the customer has messaged the business first. Any business-initiated proactive notification — order placed, shipped, delivered, cancelled, refund initiated — needs a **pre-approved Message Template**.

WhatsApp Manager → Message Templates → create one template per notification type, category **UTILITY** (transactional order updates get cheaper, faster approval than MARKETING):

| Notification type | Suggested template name |
|---|---|
| Order placed | `order_placed_update` |
| Order confirmed | `order_confirmed_update` |
| Order shipped | `order_shipped_update` |
| Order delivered | `order_delivered_update` |
| Order cancelled | `order_cancelled_update` |
| Refund initiated | `refund_initiated_update` |

Give each template two `{{1}}`/`{{2}}` body variables — the runner substitutes the notification title and message text in that order. Submit for review; approval usually takes minutes to ~24 hours. Don't go live on a template until its status shows **APPROVED**.

## 6. Map templates in the admin UI

Once each template is approved, copy its **exact template name** (not the display label you gave it in Meta's UI) into **Site Settings → WhatsApp → [type] template name**, and set the approved language code (e.g. `en`) in **Template language code**.

## 7. Enable the addon

**Site Settings → Fees → "Offer the WhatsApp order-updates addon at checkout"** — turn this on once credentials + at least one template are configured. Set the fee amount (default ₹10).

## 8. Test before wide rollout

Place a real test order with the addon checked. Confirm the buyer receives the templated WhatsApp message. Until real credentials + an approved template exist, the async delivery job will fail at the Meta API call with a clear credential/template error — that's expected, not a code bug.

## Notes

- Store-level Meta Commerce Catalog sync (product catalog on WhatsApp) uses **separate, per-store** credentials — see the [Meta Catalog Sync guide](./meta-catalog-setup.md). It shares the same Meta Business Manager account but not the same access token.
- The inbound-reply webhook (buyer messages the business number within 24h) uses the free-text send path and doesn't need a template.
