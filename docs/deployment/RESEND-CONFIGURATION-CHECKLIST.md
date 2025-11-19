# Resend API Configuration Checklist

**Date**: November 19, 2025  
**Status**: 🟡 Pending Configuration  
**Estimated Time**: 5 minutes

---

## ✅ Step-by-Step Checklist

### Step 1: Resend Account Setup

- [ ] Go to https://resend.com/signup
- [ ] Sign up with email address
- [ ] Verify email address
- [ ] Log in to Resend dashboard

**Status**: ⏳ Pending  
**Time**: ~1 minute

---

### Step 2: Domain Configuration

- [ ] Navigate to https://resend.com/domains
- [ ] Click "Add Domain"
- [ ] Enter domain: `justforview.in`
- [ ] Copy the DNS records shown

**Status**: ⏳ Pending  
**Time**: ~30 seconds

---

### Step 3: DNS Record Setup

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add:

**SPF Record**:

- [ ] Type: `TXT`
- [ ] Name: `@`
- [ ] Value: `v=spf1 include:_spf.resend.com ~all`
- [ ] TTL: Automatic or 3600

**DKIM Record**:

- [ ] Type: `TXT`
- [ ] Name: `resend._domainkey`
- [ ] Value: [Copy exact value from Resend dashboard]
- [ ] TTL: Automatic or 3600

**MX Record**:

- [ ] Type: `MX`
- [ ] Priority: `10`
- [ ] Value: `feedback-smtp.resend.com`
- [ ] TTL: Automatic or 3600

**Verification**:

- [ ] Wait 5-15 minutes for DNS propagation
- [ ] Check DNS propagation at https://dnschecker.org
- [ ] In Resend dashboard, click "Verify Domain"
- [ ] Confirm domain shows as "Verified" ✅

**Status**: ⏳ Pending  
**Time**: ~2 minutes + 5-15 min wait

---

### Step 4: API Key Generation

- [ ] Navigate to https://resend.com/api-keys
- [ ] Click "Create API Key"
- [ ] Fill in details:
  - Name: `Production - justforview.in`
  - Permission: `Sending access`
  - Domain: `justforview.in`
- [ ] Click "Create"
- [ ] **COPY THE API KEY** (starts with `re_`)
- [ ] Store it securely (you won't see it again!)

**API Key Format**: `re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**Status**: ⏳ Pending  
**Time**: ~30 seconds

---

### Step 5: Firebase Configuration

**Option A: Automated Script** (Recommended)

Open PowerShell in project directory:

```powershell
cd d:\proj\justforview.in
.\scripts\setup-resend-api.ps1
```

Follow the prompts:

- [ ] Script runs successfully
- [ ] API key entered when prompted
- [ ] Configuration verified
- [ ] Choose to deploy now or later

**Option B: Manual Configuration**

```powershell
# Navigate to project
cd d:\proj\justforview.in

# Set API key
firebase functions:config:set resend.api_key="re_YOUR_ACTUAL_API_KEY_HERE"

# Verify configuration
firebase functions:config:get
# Should show: {"resend": {"api_key": "re_..."}}

# Deploy function
firebase deploy --only functions:processAuctions
```

Manual steps:

- [ ] Command executed successfully
- [ ] Config verified with `functions:config:get`
- [ ] Deployment started
- [ ] Deployment completed successfully

**Status**: ⏳ Pending  
**Time**: ~1 minute

---

### Step 6: Deployment

- [ ] Function `processAuctions` deployed to `asia-south1`
- [ ] No deployment errors
- [ ] Function shows as active in Firebase Console
- [ ] Logs accessible via `firebase functions:log`

**Command to check deployment**:

```powershell
firebase functions:log --only processAuctions 2>&1 | Select-Object -First 10
```

**Status**: ⏳ Pending  
**Time**: ~2 minutes

---

### Step 7: Testing & Verification

**Test 1: Check Logs**

```powershell
firebase functions:log --only processAuctions
```

- [ ] Logs show function executing every minute
- [ ] No "API key not configured" warnings
- [ ] Status shows 'ok'

**Test 2: Create Test Auction**

- [ ] Go to `/seller/auctions/create`
- [ ] Create auction with:
  - End time: 2 minutes from now
  - Starting bid: ₹100
  - Add test description
- [ ] Save auction
- [ ] Wait for auction to end (~2 minutes)

**Test 3: Verify Email Delivery**

- [ ] Check email inbox (primary folder)
- [ ] Check spam/junk folder
- [ ] Email received within 1-2 minutes of auction ending
- [ ] Email formatting looks good
- [ ] Links work correctly

**Test 4: Check Resend Dashboard**

- [ ] Go to https://resend.com/emails
- [ ] Recent email shows in list
- [ ] Status shows "Delivered"
- [ ] No bounce or spam complaints

**Status**: ⏳ Pending  
**Time**: ~5 minutes

---

### Step 8: Production Validation

**Email Scenarios to Test**:

1. **No Bids Scenario**:

   - [ ] Create auction ending soon
   - [ ] Don't place any bids
   - [ ] Wait for it to end
   - [ ] Seller receives "no bids" email
   - [ ] Email content is correct

2. **Reserve Not Met Scenario**:

   - [ ] Create auction with reserve price ₹500
   - [ ] Starting bid ₹100
   - [ ] Place bid of ₹200 (below reserve)
   - [ ] Wait for it to end
   - [ ] Seller receives "reserve not met" email
   - [ ] Bidder receives "reserve not met" email
   - [ ] Both emails are correct

3. **Auction Won Scenario**:
   - [ ] Create auction with reserve price ₹500
   - [ ] Starting bid ₹100
   - [ ] Place bid of ₹600 (above reserve)
   - [ ] Wait for it to end
   - [ ] Winner receives "congratulations" email
   - [ ] Seller receives "auction sold" email
   - [ ] Both emails are correct
   - [ ] Order created automatically

**Status**: ⏳ Pending  
**Time**: ~15 minutes for all scenarios

---

### Step 9: Monitoring Setup

**Resend Monitoring**:

- [ ] Bookmark Resend dashboard: https://resend.com/emails
- [ ] Check daily for:
  - Delivery rate (target: >95%)
  - Bounce rate (target: <5%)
  - Spam rate (target: <0.1%)

**Firebase Monitoring**:

- [ ] Set up Firebase alerts for function errors
- [ ] Monitor function execution time (<30s)
- [ ] Check logs daily for any issues

**Commands to monitor**:

```powershell
# Real-time logs
firebase functions:log --only processAuctions

# Check error rate
firebase functions:log --only processAuctions 2>&1 | Select-String "error"

# Check email success rate
firebase functions:log --only processAuctions 2>&1 | Select-String "Email sent successfully"
```

**Status**: ⏳ Pending  
**Time**: ~5 minutes

---

### Step 10: Documentation Update

- [ ] Update `docs/deployment/PHASE-3-VALIDATION-SESSION.md`

  - Mark Resend API as "Configured ✅"
  - Add API key configuration date
  - Note email delivery test results

- [ ] Update `docs/deployment/PHASE-3-DEPLOYMENT-COMPLETE-NOV-19-2025.md`

  - Add "Production Validated ✅" status
  - Document email scenarios tested
  - Add monitoring links

- [ ] Mark Phase 3 as complete in project tracker

**Status**: ⏳ Pending  
**Time**: ~2 minutes

---

## 🎯 Completion Criteria

Phase 3 is **COMPLETE** when all of the following are true:

- ✅ Resend account active
- ✅ Domain `justforview.in` verified
- ✅ API key configured in Firebase
- ✅ Function deployed successfully
- ✅ All 3 email scenarios tested
- ✅ Email delivery rate >95%
- ✅ Monitoring active
- ✅ Documentation updated

---

## 📊 Current Status

**Overall Progress**: 0/10 steps complete (0%)

| Step               | Status     | Time     | Notes              |
| ------------------ | ---------- | -------- | ------------------ |
| 1. Resend Account  | ⏳ Pending | 1 min    |                    |
| 2. Domain Config   | ⏳ Pending | 30 sec   |                    |
| 3. DNS Records     | ⏳ Pending | 2-17 min | Includes wait time |
| 4. API Key         | ⏳ Pending | 30 sec   |                    |
| 5. Firebase Config | ⏳ Pending | 1 min    |                    |
| 6. Deployment      | ⏳ Pending | 2 min    |                    |
| 7. Testing         | ⏳ Pending | 5 min    |                    |
| 8. Validation      | ⏳ Pending | 15 min   |                    |
| 9. Monitoring      | ⏳ Pending | 5 min    |                    |
| 10. Documentation  | ⏳ Pending | 2 min    |                    |

**Total Time**: ~34 minutes (including DNS wait time)  
**Active Time**: ~19 minutes

---

## 🆘 Troubleshooting

### Issue: DNS not propagating

**Solution**:

- Wait 30 minutes (sometimes takes longer)
- Check at https://dnschecker.org
- Clear DNS cache on your computer: `ipconfig /flushdns`

### Issue: API key error

**Solution**:

- Regenerate API key in Resend
- Update Firebase config
- Redeploy function

### Issue: Emails going to spam

**Solution**:

- Verify all 3 DNS records are correct
- Check sender reputation at https://mxtoolbox.com
- Warm up domain gradually (Resend does this automatically)

### Issue: Function timeout

**Solution**:

- Check function logs for errors
- Verify Firestore indexes are created
- Contact Firebase support if persistent

---

## 📞 Support Resources

- **Resend Support**: support@resend.com
- **Resend Docs**: https://resend.com/docs
- **Firebase Support**: https://firebase.google.com/support
- **DNS Help**: https://dnschecker.org

---

## 🎉 Next Steps After Completion

Once Phase 3 is validated:

1. **Monitor for 24 hours**: Ensure no issues arise
2. **Communicate to stakeholders**: Email notifications now active
3. **Update user documentation**: Notify users they'll receive emails
4. **Continue with Phase 4**: UX Enhancements (Sprint 2-5)

---

**Last Updated**: November 19, 2025  
**Next Review**: After API key configuration

**Note**: Keep this checklist handy during setup. Check off items as you complete them.
