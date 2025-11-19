# Resend API Setup Script for JustForView.in
# This script helps you configure the Resend API key in Firebase

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Resend API Configuration Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "[1/5] Checking Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>$null
    Write-Host "✅ Firebase CLI found: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[2/5] Getting current Firebase configuration..." -ForegroundColor Yellow
$currentConfig = firebase functions:config:get 2>&1 | Out-String

if ($currentConfig -match "resend") {
    Write-Host "⚠️  Resend API key is already configured!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Current configuration:" -ForegroundColor Cyan
    Write-Host $currentConfig
    Write-Host ""
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Cancelled. Exiting..." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✅ No existing Resend configuration found" -ForegroundColor Green
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Quick Setup Instructions" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://resend.com/signup" -ForegroundColor White
Write-Host "2. Sign up and verify your email" -ForegroundColor White
Write-Host "3. Add domain: justforview.in" -ForegroundColor White
Write-Host "4. Add DNS records (SPF, DKIM, MX)" -ForegroundColor White
Write-Host "5. Create API key with 'Sending access'" -ForegroundColor White
Write-Host ""
Write-Host "DNS Records Required:" -ForegroundColor Yellow
Write-Host "---------------------" -ForegroundColor Yellow
Write-Host "SPF (TXT):" -ForegroundColor Cyan
Write-Host "  Name: @" -ForegroundColor White
Write-Host "  Value: v=spf1 include:_spf.resend.com ~all" -ForegroundColor White
Write-Host ""
Write-Host "DKIM (TXT):" -ForegroundColor Cyan
Write-Host "  Name: resend._domainkey" -ForegroundColor White
Write-Host "  Value: [Copy from Resend dashboard]" -ForegroundColor White
Write-Host ""
Write-Host "MX:" -ForegroundColor Cyan
Write-Host "  Priority: 10" -ForegroundColor White
Write-Host "  Value: feedback-smtp.resend.com" -ForegroundColor White
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Get API key from user
Write-Host "[3/5] Enter your Resend API key" -ForegroundColor Yellow
Write-Host "(It should start with 're_')" -ForegroundColor Gray
Write-Host ""
$apiKey = Read-Host "Resend API Key"

# Validate API key format
if (-not $apiKey) {
    Write-Host "❌ API key cannot be empty" -ForegroundColor Red
    exit 1
}

if (-not $apiKey.StartsWith("re_")) {
    Write-Host "⚠️  Warning: API key doesn't start with 're_'" -ForegroundColor Yellow
    Write-Host "Are you sure this is correct?" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Cancelled. Please check your API key." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "[4/5] Configuring Firebase Functions..." -ForegroundColor Yellow

# Set the API key
try {
    $setResult = firebase functions:config:set "resend.api_key=$apiKey" 2>&1
    Write-Host "✅ API key configured successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set API key: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[5/5] Verifying configuration..." -ForegroundColor Yellow
$verifyConfig = firebase functions:config:get 2>&1 | Out-String

if ($verifyConfig -match "resend") {
    Write-Host "✅ Configuration verified!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Current configuration:" -ForegroundColor Cyan
    Write-Host $verifyConfig
} else {
    Write-Host "⚠️  Warning: Could not verify configuration" -ForegroundColor Yellow
    Write-Host $verifyConfig
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Next Steps" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Redeploy the function:" -ForegroundColor White
Write-Host "   firebase deploy --only functions:processAuctions" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Test email delivery:" -ForegroundColor White
Write-Host "   - Create a test auction ending in 2 minutes" -ForegroundColor Gray
Write-Host "   - Wait for it to end" -ForegroundColor Gray
Write-Host "   - Check your email" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Monitor logs:" -ForegroundColor White
Write-Host "   firebase functions:log --only processAuctions" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Check Resend dashboard:" -ForegroundColor White
Write-Host "   https://resend.com/emails" -ForegroundColor Blue
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Setup Complete! 🎉" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to deploy now
$deploy = Read-Host "Do you want to deploy the function now? (y/N)"
if ($deploy -eq "y" -or $deploy -eq "Y") {
    Write-Host ""
    Write-Host "Deploying function..." -ForegroundColor Yellow
    firebase deploy --only functions:processAuctions
    
    Write-Host ""
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Check the logs to verify emails are being sent:" -ForegroundColor White
    Write-Host "firebase functions:log --only processAuctions" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Skipped deployment. Run this command when ready:" -ForegroundColor Yellow
    Write-Host "firebase deploy --only functions:processAuctions" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📚 Full guide: docs/deployment/RESEND-API-SETUP-GUIDE.md" -ForegroundColor Gray
Write-Host ""
