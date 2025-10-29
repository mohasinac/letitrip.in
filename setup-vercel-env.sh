#!/bin/bash
# Script to set up Vercel environment variables
# Usage: ./setup-vercel-env.sh

echo "🚀 Setting up Vercel Environment Variables for JustForView.in"
echo "============================================================"
echo ""
echo "Make sure you have:"
echo "1. Vercel CLI installed (npm i -g vercel@latest)"
echo "2. Logged in to Vercel (vercel login)"
echo "3. Linked to your project (vercel link)"
echo ""
read -p "Press Enter to continue..."

# Function to add environment variable to all environments
add_env() {
    local key=$1
    local value=$2
    echo "Adding $key..."
    echo "$value" | vercel env add "$key" production preview development
}

# Function to add sensitive environment variable (no echo)
add_secret() {
    local key=$1
    echo "Adding $key (secret)..."
    vercel env add "$key" production preview development
}

echo ""
echo "📝 Adding Firebase Client Variables (Public)"
add_env "NEXT_PUBLIC_FIREBASE_API_KEY" "AIzaSyCL2eA6_wFSMcyel9pxntnVOm7SFh2iWTM"
add_env "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "justforview1.firebaseapp.com"
add_env "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "justforview1"
add_env "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "justforview1.firebasestorage.app"
add_env "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "995821948299"
add_env "NEXT_PUBLIC_FIREBASE_APP_ID" "1:995821948299:web:38d1decb11eca69c7d738e"
add_env "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" "G-4BLN02DGVX"

echo ""
echo "🔐 Adding Firebase Admin SDK Variables (SECRETS)"
echo "You will be prompted to enter these values"
add_secret "FIREBASE_ADMIN_PROJECT_ID"
add_secret "FIREBASE_ADMIN_CLIENT_EMAIL"
add_secret "FIREBASE_ADMIN_PRIVATE_KEY"

echo ""
echo "🔑 Adding Authentication Variables"
add_secret "JWT_SECRET"
add_env "JWT_EXPIRES_IN" "7d"

echo ""
echo "🌐 Adding App Configuration"
add_env "NEXT_PUBLIC_APP_URL" "https://justforview.in"
add_env "NEXT_PUBLIC_API_URL" "/api"

echo ""
echo "💳 Adding Payment Gateway (Razorpay) - Optional"
read -p "Do you want to add Razorpay configuration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    add_secret "RAZORPAY_KEY_ID"
    add_secret "RAZORPAY_KEY_SECRET"
    add_secret "RAZORPAY_WEBHOOK_SECRET"
    add_secret "NEXT_PUBLIC_RAZORPAY_KEY_ID"
fi

echo ""
echo "📦 Adding Shipping (Shiprocket) - Optional"
read -p "Do you want to add Shiprocket configuration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    add_env "SHIPROCKET_BASE_URL" "https://apiv2.shiprocket.in/v1"
    add_secret "SHIPROCKET_EMAIL"
    add_secret "SHIPROCKET_PASSWORD"
    add_secret "SHIPROCKET_CHANNEL_ID"
fi

echo ""
echo "🚩 Adding Feature Flags"
add_env "NEXT_PUBLIC_ENABLE_ANALYTICS" "false"
add_env "NEXT_PUBLIC_ENABLE_SENTRY" "false"
add_env "NEXT_PUBLIC_MAINTENANCE_MODE" "false"

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify variables in Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Deploy your application: vercel --prod"
echo "3. Check deployment logs for any issues"
echo ""
echo "📖 For more information, see VERCEL_ENV_SETUP.md"
