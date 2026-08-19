# Razorpay Setup

Razorpay is disabled by default on this platform — manual UPI/bank transfer and Cash on Delivery are the default payment methods. Enable Razorpay only once you have real (or test-mode) API keys.

## 1. Create a Razorpay account

Sign up at [razorpay.com](https://razorpay.com). For development, use **Test Mode** keys — no real money moves and no KYC is required to start integrating.

## 2. Get your API keys

Dashboard → Settings → API Keys → Generate Key. This gives you a **Key ID** (public, safe to expose to the client) and a **Key Secret** (private, server-only).

## 3. Configure a webhook

Dashboard → Settings → Webhooks → Add New Webhook. Point it at `https://<your-domain>/api/payment/webhook`. Copy the **Webhook Secret** shown after creation — it's used to verify that webhook calls actually came from Razorpay (HMAC signature check).

## 4. Enter credentials in the admin UI

**Site Settings → Integrations**:

- **Client ID** → your Razorpay Key ID
- **Client Secret** → your Razorpay Key Secret
- Webhook secret is configured the same way, under the same credentials block.

## 5. Enable the payment method

**Site Settings → Shipping tab → Payment methods → "Razorpay (online card/UPI) enabled"**. This is off by default — manual payment stays the platform default even after Razorpay is configured, so you can test Razorpay in isolation before flipping it on for real buyers.

## 6. Go live

Switch from Test Mode to Live Mode keys in the Razorpay dashboard once you're ready for real transactions (requires KYC/business verification on Razorpay's side). Update the same two credential fields in Site Settings with the live keys.

## How it's used in this codebase

- `POST /api/payment/create-order` computes the exact amount server-side from the buyer's live cart (never trusts a client-supplied amount) and creates a Razorpay order.
- `POST /api/payment/verify` verifies the payment signature, decrements stock, and places the order(s).
- `POST /api/payment/webhook` is a fast, bounded fallback signal handler — signature-verified, no heavy work.

None of these routes need code changes to go live — only the credentials + the `razorpayEnabled` toggle.
