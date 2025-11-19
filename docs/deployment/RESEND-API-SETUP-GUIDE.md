# Resend API Key Setup Guide

**Estimated Time**: 5 minutes  
**Difficulty**: Easy  
**Cost**: FREE (3,000 emails/month)

---

## 🎯 Quick Setup (5 Steps)

### Step 1: Sign Up for Resend

1. Go to: https://resend.com/signup
2. Sign up with email
3. Verify your email address
4. Log in to dashboard

---

### Step 2: Add & Verify Domain

1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter: `justforview.in`
4. Add the following DNS records to your domain registrar:

**SPF Record** (for sender verification):

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM Record** (for email authentication):

```
Type: TXT
Name: resend._domainkey
Value: [Provided by Resend - copy from dashboard]
```

**MX Record** (for bounce handling):

```
Type: MX
Priority: 10
Value: feedback-smtp.resend.com
```

5. Click "Verify Domain" in Resend dashboard
6. Wait for DNS propagation (usually 5-15 minutes)

---

### Step 3: Create API Key

1. Go to: https://resend.com/api-keys
2. Click "Create API Key"
3. Fill in:
   - **Name**: `Production - justforview.in`
   - **Permission**: `Sending access`
   - **Domain**: `justforview.in`
4. Click "Create"
5. **COPY THE API KEY** (starts with `re_`) - you won't see it again!

Example API key format:

```
re_123abc456def789ghi012jkl345mno678pqr
```

---

### Step 4: Configure in Firebase

Open PowerShell and run:

```powershell
# Navigate to project directory
cd d:\proj\justforview.in

# Set the Resend API key
firebase functions:config:set resend.api_key="re_YOUR_API_KEY_HERE"

# Verify it was set
firebase functions:config:get

# Should show:
# {
#   "resend": {
#     "api_key": "re_YOUR_API_KEY_HERE"
#   }
# }
```

---

### Step 5: Redeploy Function

```powershell
# Redeploy with new configuration
firebase deploy --only functions:processAuctions

# Wait for deployment (~2 minutes)
# Should see: "Deploy complete!"
```

---

## ✅ Verify It's Working

### Check Logs

```powershell
# View recent function logs
firebase functions:log 2>&1 | Select-Object -First 20

# Look for:
✅ "Email sent successfully to..."
✅ "Notification sent to [email]"

# Should NOT see:
❌ "⚠️ Resend API key not configured"
```

### Test Email

1. **Create test auction**:

   - Go to: `/seller/auctions/create`
   - Create auction ending in 2 minutes
   - Save

2. **Wait for it to end**

3. **Check your email**:
   - Should receive notification
   - Check spam folder if not in inbox
   - Verify formatting looks good

---

## 🔧 Troubleshooting

### Issue: "Domain not verified"

**Solution**:

- Wait 15-30 minutes for DNS propagation
- Check DNS records at https://dnschecker.org
- Ensure all 3 records (SPF, DKIM, MX) are added correctly

### Issue: "API key invalid"

**Solution**:

- Regenerate API key in Resend dashboard
- Update Firebase config with new key
- Redeploy function

### Issue: "Emails going to spam"

**Solution**:

- Verify SPF, DKIM, MX records
- Check sender reputation at https://mxtoolbox.com
- Warm up domain by sending gradually (Resend handles this)

### Issue: "Function still logging 'not configured'"

**Solution**:

```powershell
# 1. Verify config is set
firebase functions:config:get

# 2. If not showing, set again
firebase functions:config:set resend.api_key="re_YOUR_KEY"

# 3. Clear cache
firebase functions:config:unset resend.api_key
firebase functions:config:set resend.api_key="re_YOUR_KEY"

# 4. Redeploy
firebase deploy --only functions:processAuctions
```

---

## 📊 Monitor Usage

### Resend Dashboard

Visit: https://resend.com/emails

**Check**:

- ✅ Emails sent today
- ✅ Delivery rate (target: >95%)
- ✅ Bounce rate (target: <5%)
- ✅ Spam rate (target: <0.1%)

### Firebase Logs

```powershell
# Monitor real-time logs
firebase functions:log --only processAuctions
```

---

## 💰 Cost Management

### Free Tier Limits

**Resend FREE Tier**:

- 3,000 emails/month
- 100 emails/day
- No credit card required

**Typical Usage**:

- ~850 emails/month (500 auctions)
- ~28 emails/day average
- **Well within free tier** ✅

### What If You Exceed?

**Resend Pricing** (if needed):

- $0.001 per email after 3,000
- So 10,000 emails = $7/month
- Very affordable scaling

---

## 🔐 Security Best Practices

### API Key Security

✅ **DO**:

- Store in Firebase config (secure)
- Never commit to Git
- Rotate every 90 days
- Use separate keys for dev/prod

❌ **DON'T**:

- Hardcode in source files
- Share publicly
- Use same key across projects
- Store in client-side code

### Email Security

✅ **DO**:

- Verify domain properly
- Use DKIM/SPF/DMARC
- Monitor spam reports
- Handle bounces

❌ **DON'T**:

- Send from unverified domain
- Skip DNS configuration
- Ignore deliverability issues
- Send without user consent

---

## 📚 Resources

### Documentation

- Resend Docs: https://resend.com/docs
- Resend Quickstart: https://resend.com/docs/send-with-nodejs
- Firebase Config: https://firebase.google.com/docs/functions/config-env

### Support

- Resend Support: support@resend.com
- Resend Community: https://resend.com/community
- Firebase Support: https://firebase.google.com/support

### Tools

- DNS Checker: https://dnschecker.org
- MX Toolbox: https://mxtoolbox.com
- SPF Checker: https://www.spf-record.com

---

## ✨ After Setup

Once Resend is configured:

1. ✅ Test all 3 email scenarios
2. ✅ Monitor logs for successful sends
3. ✅ Check Resend dashboard daily
4. ✅ Verify email deliverability
5. ✅ Mark Phase 3 as "Production Validated"

---

## 🎊 Success Checklist

- [ ] Resend account created
- [ ] Domain verified (justforview.in)
- [ ] API key generated
- [ ] Firebase config updated
- [ ] Function redeployed
- [ ] Test email received
- [ ] All 3 scenarios tested
- [ ] Monitoring active

**When all checked, Phase 3 is COMPLETE!** 🚀

---

**Last Updated**: November 19, 2025  
**Next Review**: After API key configuration
