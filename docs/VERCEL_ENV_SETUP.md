# Vercel Environment Variables Setup Guide

This guide explains how to set up environment variables for Vercel deployment using the automated script.

## Overview

The `set-vercel-env.js` script automatically reads environment variables from `vercel.json` and sets them in your Vercel project. This eliminates the need to manually add each environment variable through the Vercel dashboard.

## Prerequisites

- Vercel CLI installed (`npm i -g vercel`)
- Logged in to Vercel (`vercel login`)
- Project linked to Vercel (`vercel link`)

## Environment Variables

The following environment variables are configured for the application:

### Firebase Configuration

- `FIREBASE_ADMIN_PROJECT_ID` - Firebase project ID for admin SDK
- `FIREBASE_ADMIN_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_ADMIN_PRIVATE_KEY` - Firebase service account private key
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase client API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID for client
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase analytics measurement ID

### Authentication & Security

- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - JWT token expiration time
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - NextAuth.js URL for authentication

### Payment Gateway (Razorpay)

- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay public key ID
- `RAZORPAY_KEY_ID` - Razorpay key ID for server-side
- `RAZORPAY_KEY_SECRET` - Razorpay secret key
- `RAZORPAY_WEBHOOK_SECRET` - Razorpay webhook secret

### Shipping (Shiprocket)

- `SHIPROCKET_EMAIL` - Shiprocket account email
- `SHIPROCKET_PASSWORD` - Shiprocket account password
- `SHIPROCKET_CHANNEL_ID` - Shiprocket channel ID
- `SHIPROCKET_BASE_URL` - Shiprocket API base URL

### Application Configuration

- `NEXT_PUBLIC_API_URL` - Base URL for API endpoints
- `NEXT_PUBLIC_SITE_URL` - Main site URL
- `NEXT_PUBLIC_SITE_NAME` - Application name
- `NODE_ENV` - Environment mode (production/development)
- `USE_FIREBASE_EMULATOR` - Whether to use Firebase emulator

### Rate Limiting & File Handling

- `API_RATE_LIMIT` - API rate limit per window
- `API_RATE_WINDOW` - Rate limiting window in milliseconds
- `RATE_LIMIT_WINDOW_MS` - Rate limit window
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window
- `MAX_FILE_SIZE` - Maximum file upload size
- `ALLOWED_FILE_TYPES` - Allowed file types for upload

### Coupon System

- `COUPON_CODE_LENGTH` - Length of generated coupon codes
- `COUPON_CODE_PREFIX` - Prefix for coupon codes

## Usage

### Method 1: Using the Automated Script

1. Ensure all environment variables are properly set in `vercel.json`
2. Run the script:
   ```bash
   node set-vercel-env.js
   ```

The script will:

- Read all environment variables from `vercel.json`
- Attempt to add each variable to Vercel
- If a variable already exists, it will remove and re-add it with the new value
- Provide success/failure feedback for each variable

### Method 2: Manual Setup via Vercel CLI

For individual variables:

```bash
# Add a new environment variable
echo "your_value_here" | vercel env add VARIABLE_NAME production

# Remove an existing variable
vercel env rm VARIABLE_NAME production --yes
```

### Method 3: Vercel Dashboard

1. Go to your project in the Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable manually

## Script Features

The `set-vercel-env.js` script includes:

- **Error Handling**: Captures and reports errors during variable setting
- **Update Logic**: Automatically handles existing variables by removing and re-adding
- **Progress Feedback**: Shows success/failure status for each variable
- **Proper Escaping**: Handles special characters in environment values
- **Multi-line Support**: Correctly processes multi-line values like private keys

## Verification

After running the script, verify all variables are set:

```bash
vercel env ls
```

## Security Notes

- Never commit actual production secrets to version control
- Use placeholder values in `vercel.json` for demonstration
- Store real secrets securely and update them manually if needed
- Regularly rotate sensitive keys like JWT secrets and API keys

## Troubleshooting

### Common Issues

1. **Authentication Error**: Run `vercel login` to authenticate
2. **Project Not Linked**: Run `vercel link` to link your project
3. **Permission Denied**: Ensure you have admin access to the Vercel project
4. **Variable Already Exists**: The script handles this automatically by removing and re-adding

### Manual Cleanup

If you need to remove all environment variables:

```bash
# List all variables first
vercel env ls

# Remove variables individually
vercel env rm VARIABLE_NAME production --yes
```

## Deployment

After setting environment variables, deploy your application:

```bash
vercel --prod
```

The deployment will now have access to all configured environment variables.
