# Script to set up Vercel environment variables for Windows
# Usage: .\setup-vercel-env.ps1

Write-Host "🚀 Setting up Vercel Environment Variables for HobbiesSpot.com" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "1. Vercel CLI installed (npm i -g vercel@latest)"
Write-Host "2. Logged in to Vercel (vercel login)"
Write-Host "3. Linked to your project (vercel link)"
Write-Host ""
Read-Host "Press Enter to continue..."

# Function to add environment variable to all environments
function Add-VercelEnv {
    param(
        [string]$Key,
        [string]$Value,
        [switch]$IsSecret
    )
    
    Write-Host "Adding $Key..." -ForegroundColor Green
    
    if ($IsSecret) {
        # For secrets, let user enter value
        vercel env add $Key production preview development
    } else {
        # For non-secrets, pipe the value
        $Value | vercel env add $Key production preview development
    }
}

Write-Host ""
Write-Host "📝 Adding Firebase Client Variables (Public)" -ForegroundColor Cyan
Add-VercelEnv -Key "NEXT_PUBLIC_FIREBASE_API_KEY" -Value "AIzaSyCL2eA6_wFSMcyel9pxntnVOm7SFh2iWTM"
Add-VercelEnv -Key "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" -Value "justforview1.firebaseapp.com"
Add-VercelEnv -Key "NEXT_PUBLIC_FIREBASE_PROJECT_ID" -Value "justforview1"
Add-VercelEnv -Key "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" -Value "justforview1.firebasestorage.app"
Add-VercelEnv -Key "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" -Value "995821948299"
Add-VercelEnv -Key "NEXT_PUBLIC_FIREBASE_APP_ID" -Value "1:995821948299:web:38d1decb11eca69c7d738e"
Add-VercelEnv -Key "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" -Value "G-4BLN02DGVX"

Write-Host ""
Write-Host "🔐 Adding Firebase Admin SDK Variables (SECRETS)" -ForegroundColor Cyan
Write-Host "You will be prompted to enter these values" -ForegroundColor Yellow
Add-VercelEnv -Key "FIREBASE_ADMIN_PROJECT_ID" -IsSecret
Add-VercelEnv -Key "FIREBASE_ADMIN_CLIENT_EMAIL" -IsSecret
Add-VercelEnv -Key "FIREBASE_ADMIN_PRIVATE_KEY" -IsSecret

Write-Host ""
Write-Host "🔑 Adding Authentication Variables" -ForegroundColor Cyan
Write-Host "Generate JWT_SECRET with: node -e `"console.log(require('crypto').randomBytes(32).toString('hex'))`"" -ForegroundColor Yellow
Add-VercelEnv -Key "JWT_SECRET" -IsSecret
Add-VercelEnv -Key "JWT_EXPIRES_IN" -Value "7d"

Write-Host ""
Write-Host "🌐 Adding App Configuration" -ForegroundColor Cyan
Add-VercelEnv -Key "NEXT_PUBLIC_APP_URL" -Value "https://www.hobbiesspot.com"
Add-VercelEnv -Key "NEXT_PUBLIC_API_URL" -Value "/api"

Write-Host ""
$razorpay = Read-Host "💳 Do you want to add Razorpay configuration? (y/n)"
if ($razorpay -eq 'y' -or $razorpay -eq 'Y') {
    Write-Host "Adding Razorpay variables..." -ForegroundColor Cyan
    Add-VercelEnv -Key "RAZORPAY_KEY_ID" -IsSecret
    Add-VercelEnv -Key "RAZORPAY_KEY_SECRET" -IsSecret
    Add-VercelEnv -Key "RAZORPAY_WEBHOOK_SECRET" -IsSecret
    Add-VercelEnv -Key "NEXT_PUBLIC_RAZORPAY_KEY_ID" -IsSecret
}

Write-Host ""
$shiprocket = Read-Host "📦 Do you want to add Shiprocket configuration? (y/n)"
if ($shiprocket -eq 'y' -or $shiprocket -eq 'Y') {
    Write-Host "Adding Shiprocket variables..." -ForegroundColor Cyan
    Add-VercelEnv -Key "SHIPROCKET_BASE_URL" -Value "https://apiv2.shiprocket.in/v1"
    Add-VercelEnv -Key "SHIPROCKET_EMAIL" -IsSecret
    Add-VercelEnv -Key "SHIPROCKET_PASSWORD" -IsSecret
    Add-VercelEnv -Key "SHIPROCKET_CHANNEL_ID" -IsSecret
}

Write-Host ""
Write-Host "🚩 Adding Feature Flags" -ForegroundColor Cyan
Add-VercelEnv -Key "NEXT_PUBLIC_ENABLE_ANALYTICS" -Value "false"
Add-VercelEnv -Key "NEXT_PUBLIC_ENABLE_SENTRY" -Value "false"
Add-VercelEnv -Key "NEXT_PUBLIC_MAINTENANCE_MODE" -Value "false"

Write-Host ""
Write-Host "✅ Environment variables setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify variables in Vercel Dashboard: https://vercel.com/dashboard"
Write-Host "2. Deploy your application: vercel --prod"
Write-Host "3. Check deployment logs for any issues"
Write-Host ""
Write-Host "📖 For more information, see VERCEL_ENV_SETUP.md" -ForegroundColor Yellow
