# 🚀 Resend API Quick Setup - 5 Minutes

## ⚡ Super Quick Start

### 1. Sign Up (1 minute)

```
https://resend.com/signup
```

- Sign up with email
- Verify email
- Login

### 2. Add Domain (30 seconds)

- Dashboard → Domains → "Add Domain"
- Enter: `justforview.in`

### 3. Configure DNS (2 minutes)

Add these 3 records to your domain registrar:

**SPF** (TXT):

```
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM** (TXT):

```
Name: resend._domainkey
Value: [Copy from Resend dashboard - unique per domain]
```

**MX**:

```
Priority: 10
Value: feedback-smtp.resend.com
```

### 4. Create API Key (30 seconds)

- Dashboard → API Keys → "Create API Key"
- Name: `Production - justforview.in`
- Permission: `Sending access`
- Copy the key (starts with `re_`)

### 5. Configure Firebase (1 minute)

**Option A: Run Setup Script** (Recommended)

```powershell
cd d:\proj\justforview.in
.\scripts\setup-resend-api.ps1
```

Follow the prompts and paste your API key.

**Option B: Manual Setup**

```powershell
# Set API key
firebase functions:config:set resend.api_key="re_YOUR_API_KEY_HERE"

# Verify
firebase functions:config:get

# Deploy
firebase deploy --only functions:processAuctions
```

---

## ✅ Verify It's Working

### Check Logs (30 seconds)

```powershell
firebase functions:log --only processAuctions
```

**Look for**:

- ✅ "Email sent successfully to..."
- ✅ No "⚠️ Resend API key not configured"

### Test Email (2 minutes)

1. Create auction ending in 2 minutes
2. Wait for it to end
3. Check email (check spam folder too)

---

## 🆘 Troubleshooting

### "Domain not verified"

- Wait 15-30 minutes for DNS propagation
- Check DNS: https://dnschecker.org
- Verify all 3 records added correctly

### "API key invalid"

- Regenerate key in Resend dashboard
- Update Firebase config
- Redeploy function

### "Still showing 'not configured'"

```powershell
# Clear and reset
firebase functions:config:unset resend.api_key
firebase functions:config:set resend.api_key="re_YOUR_KEY"
firebase deploy --only functions:processAuctions
```

---

## 📊 Monitor Usage

### Resend Dashboard

```
https://resend.com/emails
```

- Emails sent: Should be 0-3 per auction
- Delivery rate: Target >95%
- Free tier: 3,000/month (you'll use ~850)

### Firebase Logs

```powershell
# Real-time monitoring
firebase functions:log --only processAuctions

# Last 20 entries
firebase functions:log --only processAuctions 2>&1 | Select-Object -First 20
```

---

## 💰 Cost

**FREE Tier**: 3,000 emails/month
**Your Usage**: ~850 emails/month (500 auctions × 1-3 emails each)
**Result**: 100% FREE ✅

---

## 🔐 Security

- ✅ API key stored in Firebase config (secure)
- ✅ Never committed to Git
- ✅ Separate keys for dev/prod
- ⚠️ Rotate every 90 days

---

## 📚 Resources

- **Setup Guide**: `docs/deployment/RESEND-API-SETUP-GUIDE.md`
- **Resend Docs**: https://resend.com/docs
- **DNS Checker**: https://dnschecker.org
- **Support**: support@resend.com

---

## 🎯 Success Checklist

- [ ] Resend account created
- [ ] Domain verified (justforview.in)
- [ ] API key generated
- [ ] Firebase config updated
- [ ] Function deployed
- [ ] Test email received
- [ ] Logs show "Email sent successfully"
- [ ] Phase 3 marked as COMPLETE

**When all checked: Phase 3 is DONE! 🎉**

---

**Estimated Time**: 5 minutes  
**Difficulty**: Easy  
**Cost**: FREE

Need help? Check the full guide or open a support ticket.
