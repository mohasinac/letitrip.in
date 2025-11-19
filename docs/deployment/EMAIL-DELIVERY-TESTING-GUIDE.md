# Email Delivery Testing Guide

**Date**: November 19, 2025  
**Duration**: 30 minutes  
**Status**: 🟡 Ready to Test

---

## 🎯 Testing Overview

We'll test all 3 email notification scenarios to ensure the Resend API is working correctly.

---

## ✅ Test 1: No Bids Email (5 minutes)

### Setup:

1. Go to: http://localhost:3000/seller/auctions/create (or your local dev URL)
2. Create auction with these details:

```
Name: Test Auction - No Bids
Description: Testing email notifications for auctions with no bids
Starting Bid: ₹100
Reserve Price: (leave empty)
End Time: 2 minutes from now (e.g., if it's 13:10, set to 13:12)
Category: Any
Images: Upload at least 1 image
```

3. Click "Create Auction"
4. Copy the auction URL for reference

### Wait:

- ⏳ Wait 2 minutes for auction to end
- ☕ Grab coffee or check other tasks

### Verify:

After 2 minutes, check:

**Firebase Logs**:

```powershell
firebase functions:log --only processAuctions 2>&1 | Select-Object -First 20
```

Look for:

- ✅ "Found 1 auctions to process"
- ✅ "Closing auction [id]"
- ✅ "Auction [id] ended with no bids"
- ✅ "Notified seller of no-bid auction"
- ✅ NO errors

**Email Inbox**:

1. Check seller's email inbox
2. Check spam/junk folder if not in inbox
3. Subject should be: "Your auction 'Test Auction - No Bids' has ended with no bids"

**Email Content Checklist**:

- [ ] Email received within 2-3 minutes
- [ ] Subject line correct
- [ ] Seller name displayed correctly
- [ ] Auction name correct
- [ ] Starting bid shown (₹100)
- [ ] Product image displayed
- [ ] "View Auction" button works
- [ ] Suggestions section visible
- [ ] Email formatting looks professional
- [ ] No broken images or links

### Expected Result:

✅ Seller receives professional email notification  
✅ Email contains auction details and suggestions  
✅ Links work correctly

---

## ✅ Test 2: Reserve Not Met Email (10 minutes)

### Setup:

1. Go to: http://localhost:3000/seller/auctions/create
2. Create auction with these details:

```
Name: Test Auction - Reserve Not Met
Description: Testing email notifications for reserve price not met
Starting Bid: ₹100
Reserve Price: ₹500 (important!)
End Time: 2 minutes from now
Category: Any
Images: Upload at least 1 image
```

3. Click "Create Auction"
4. **Important**: Note the auction ID or URL

### Place Bid:

1. Open the auction page in another browser/incognito window
2. Sign in as a different user (bidder)
3. Place bid of **₹200** (must be < ₹500 reserve)
4. Confirm bid placed successfully

### Wait:

- ⏳ Wait 2 minutes for auction to end
- 📝 Note down bidder's email address

### Verify:

After 2 minutes, check:

**Firebase Logs**:

```powershell
firebase functions:log --only processAuctions 2>&1 | Select-Object -First 30
```

Look for:

- ✅ "Found 1 auctions to process"
- ✅ "Auction [id] ended - reserve price not met"
- ✅ "Notified seller and bidder of reserve not met"
- ✅ NO errors

**Seller Email**:

1. Check seller's email inbox
2. Subject: "Your auction 'Test Auction - Reserve Not Met' ended - Reserve price not met"

**Seller Email Content Checklist**:

- [ ] Email received
- [ ] Highest bid shown (₹200)
- [ ] Reserve price shown (₹500)
- [ ] Highest bidder name shown
- [ ] Auction image displayed
- [ ] "View Auction" button works
- [ ] Explanation that item wasn't sold
- [ ] Formatting looks good

**Bidder Email**:

1. Check bidder's email inbox
2. Subject: "Auction ended: 'Test Auction - Reserve Not Met' - Reserve price not met"

**Bidder Email Content Checklist**:

- [ ] Email received
- [ ] Your bid shown (₹200)
- [ ] Reserve price shown (₹500)
- [ ] Explanation that bid didn't meet reserve
- [ ] Auction image displayed
- [ ] "View Auction" button works
- [ ] Professional formatting

### Expected Result:

✅ Both seller and bidder receive emails  
✅ Emails clearly explain reserve not met  
✅ All details are accurate

---

## ✅ Test 3: Auction Won Email (10 minutes)

### Setup:

1. Go to: http://localhost:3000/seller/auctions/create
2. Create auction with these details:

```
Name: Test Auction - Won
Description: Testing email notifications for successful auction win
Starting Bid: ₹100
Reserve Price: ₹500
End Time: 2 minutes from now
Category: Any
Images: Upload at least 1 image
```

3. Click "Create Auction"

### Place Winning Bid:

1. Open auction in another browser/incognito
2. Sign in as bidder
3. Place bid of **₹600** (must be ≥ ₹500 reserve)
4. Confirm bid placed successfully

### Wait:

- ⏳ Wait 2 minutes for auction to end

### Verify:

After 2 minutes, check:

**Firebase Logs**:

```powershell
firebase functions:log --only processAuctions 2>&1 | Select-Object -First 30
```

Look for:

- ✅ "Found 1 auctions to process"
- ✅ "Auction [id] won by user [uid] for ₹600"
- ✅ "Created order [orderId] for winner"
- ✅ "Notified winner and seller of auction completion"
- ✅ NO errors

**Winner Email**:

1. Check winner's email inbox
2. Subject: "🎉 Congratulations! You won 'Test Auction - Won'"

**Winner Email Content Checklist**:

- [ ] Email received
- [ ] Congratulations message prominent
- [ ] Winning bid shown (₹600)
- [ ] Auction image displayed
- [ ] "What's Next" section with 3 steps
- [ ] "View Your Order" button works
- [ ] "View Auction" button works
- [ ] Professional green/success theme
- [ ] No broken elements

**Seller Email**:

1. Check seller's email inbox
2. Subject: "✅ Your auction 'Test Auction - Won' has sold!"

**Seller Email Content Checklist**:

- [ ] Email received
- [ ] Sale confirmation clear
- [ ] Winner name shown
- [ ] Final bid shown (₹600)
- [ ] Auction image displayed
- [ ] "Next Steps" explained
- [ ] "View Auction" button works
- [ ] Professional formatting

**Order Creation**:

1. Check winner's orders page
2. Verify order was created automatically
3. Order should show:
   - Auction item
   - Price: ₹600
   - Status: Pending payment
   - Tax calculated (18%)

### Expected Result:

✅ Winner receives congratulations email  
✅ Seller receives sale notification  
✅ Order created automatically  
✅ All details accurate

---

## 🔍 Additional Verification

### Resend Dashboard

1. Go to: https://resend.com/emails
2. Check recent emails:
   - [ ] All test emails appear in list
   - [ ] Status shows "Delivered" (not bounced/failed)
   - [ ] Delivery time is reasonable (<1 minute)
   - [ ] No spam complaints

### Firebase Console

1. Go to: https://console.firebase.google.com/project/letitrip-in-app/functions
2. Check processAuctions function:
   - [ ] Invocations increased by 3 (one per auction)
   - [ ] No errors logged
   - [ ] Execution time reasonable (<5s)
   - [ ] Memory usage acceptable (<512MB)

### Database Check

```powershell
# Check auctions collection in Firestore
# Verify all 3 test auctions have:
# - status: "ended"
# - winner_id: set (for Test 3 only)
# - final_bid: set (for Tests 2 and 3)
```

---

## ⚠️ Troubleshooting

### Issue: No email received after 5 minutes

**Check**:

1. Firebase logs for errors
2. Spam folder
3. Email address is correct
4. Resend API key is valid

**Solution**:

```powershell
# Check if API key is configured
firebase functions:config:get

# Should show resend.api_key

# Check function logs
firebase functions:log --only processAuctions 2>&1 | Select-String "error"
```

### Issue: Email in spam folder

**Cause**: DNS records not configured

**Solution**: Add SPF, DKIM, MX records (see DNS setup guide)

### Issue: Function timeout

**Check**:

```powershell
firebase functions:log --only processAuctions 2>&1 | Select-String "timeout"
```

**Solution**:

- Check Firestore indexes
- Verify network connectivity
- Check Resend API status

### Issue: Wrong email content

**Check**:

- Auction data in Firestore
- User data (name, email)
- Function code for template errors

**Solution**: Review notification service code

---

## 📊 Test Results Template

```
Test 1: No Bids
- Email Sent: [ ] Yes [ ] No
- Delivery Time: ___ minutes
- Content Correct: [ ] Yes [ ] No
- Links Work: [ ] Yes [ ] No
- Issues: ___

Test 2: Reserve Not Met
- Seller Email: [ ] Yes [ ] No
- Bidder Email: [ ] Yes [ ] No
- Delivery Time: ___ minutes
- Content Correct: [ ] Yes [ ] No
- Links Work: [ ] Yes [ ] No
- Issues: ___

Test 3: Auction Won
- Winner Email: [ ] Yes [ ] No
- Seller Email: [ ] Yes [ ] No
- Order Created: [ ] Yes [ ] No
- Delivery Time: ___ minutes
- Content Correct: [ ] Yes [ ] No
- Links Work: [ ] Yes [ ] No
- Issues: ___

Overall Status: [ ] PASS [ ] FAIL
Notes: ___
```

---

## ✅ Success Criteria

Phase 3 email testing is **SUCCESSFUL** when:

- [x] All 3 email scenarios tested
- [x] All emails delivered successfully
- [x] Delivery time < 2 minutes
- [x] Email content is accurate
- [x] All links work correctly
- [x] Images display properly
- [x] No errors in logs
- [x] Orders created automatically (Test 3)
- [x] Resend dashboard shows delivered status

---

## 🎉 After Testing

Once all tests pass:

1. ✅ Mark Phase 3 as "Production Validated"
2. ✅ Document test results
3. ✅ Update status in project tracker
4. ✅ Celebrate! 🎊

---

## 📞 Need Help?

- **Resend Issues**: support@resend.com
- **Firebase Issues**: https://firebase.google.com/support
- **Function Code**: Check `functions/src/index.ts`
- **Email Templates**: Check `functions/src/services/notification.service.ts`

---

**Ready to Test?** Start with Test 1 (No Bids) and work through each scenario!

Good luck! 🚀
