# DNS Records Setup for Resend - Quick Guide

**Estimated Time**: 15 minutes  
**Difficulty**: Easy  
**Impact**: HIGH (prevents emails going to spam)

---

## 🎯 Why Add DNS Records?

Without proper DNS records:

- ❌ Emails may go to spam folder
- ❌ Low deliverability rate (~60-70%)
- ❌ Email clients mark as "unverified sender"

With DNS records:

- ✅ Emails land in inbox
- ✅ High deliverability rate (>95%)
- ✅ Professional sender reputation

---

## 📋 Required DNS Records

You need to add **3 DNS records** to your domain registrar:

### 1. SPF Record (Sender Policy Framework)

**Purpose**: Authorizes Resend to send emails on behalf of justforview.in

```
Type: TXT
Name: @ (or justforview.in)
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600 (or Auto)
```

### 2. DKIM Record (DomainKeys Identified Mail)

**Purpose**: Cryptographic signature to verify email authenticity

```
Type: TXT
Name: resend._domainkey
Value: [Get from Resend dashboard - unique per domain]
TTL: 3600 (or Auto)
```

⚠️ **Important**: Copy exact DKIM value from Resend dashboard!

### 3. MX Record (Mail Exchange)

**Purpose**: Handles bounce emails and feedback loops

```
Type: MX
Priority: 10
Value: feedback-smtp.resend.com
TTL: 3600 (or Auto)
```

---

## 🚀 Step-by-Step Setup

### Step 1: Get DKIM Value from Resend (2 minutes)

1. Go to: https://resend.com/domains
2. Find "justforview.in" in the list
3. Click on the domain name
4. Copy the **DKIM record value** (long string starting with `p=`)
5. Keep this value handy

Example DKIM value:

```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (very long)
```

### Step 2: Log in to Your Domain Registrar (1 minute)

Your domain is likely hosted at one of these:

- GoDaddy
- Namecheap
- Cloudflare
- Google Domains
- Route 53 (AWS)
- Other

Find your DNS management page (usually called "DNS Settings" or "DNS Management")

### Step 3: Add SPF Record (3 minutes)

1. Click "Add Record" or "Add DNS Record"
2. Select record type: **TXT**
3. Fill in:
   ```
   Name/Host: @ (or leave empty or type "justforview.in")
   Value/Content: v=spf1 include:_spf.resend.com ~all
   TTL: 3600 (or Auto)
   ```
4. Click "Save" or "Add Record"

**Visual Example**:

```
+----------------+-------------------------+
| Type: TXT      |                         |
| Name: @        |                         |
| Value: v=spf1 include:_spf.resend.com ~all |
| TTL: 3600      |                         |
+----------------+-------------------------+
[Save Record]
```

### Step 4: Add DKIM Record (3 minutes)

1. Click "Add Record" again
2. Select record type: **TXT**
3. Fill in:
   ```
   Name/Host: resend._domainkey
   Value/Content: [Paste the DKIM value from Step 1]
   TTL: 3600 (or Auto)
   ```
4. Click "Save"

**Important**:

- Copy the ENTIRE DKIM value (it's very long)
- Don't add quotes around it
- Some registrars might ask you to remove `p=` prefix - check their docs

**Visual Example**:

```
+----------------+-------------------------+
| Type: TXT      |                         |
| Name: resend._domainkey                  |
| Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNA... (long string) |
| TTL: 3600      |                         |
+----------------+-------------------------+
[Save Record]
```

### Step 5: Add MX Record (3 minutes)

1. Click "Add Record" again
2. Select record type: **MX**
3. Fill in:
   ```
   Name/Host: @ (or leave empty)
   Priority: 10
   Value/Points to: feedback-smtp.resend.com
   TTL: 3600 (or Auto)
   ```
4. Click "Save"

**Visual Example**:

```
+----------------+-------------------------+
| Type: MX       |                         |
| Name: @        |                         |
| Priority: 10   |                         |
| Value: feedback-smtp.resend.com         |
| TTL: 3600      |                         |
+----------------+-------------------------+
[Save Record]
```

### Step 6: Wait for DNS Propagation (5-30 minutes)

DNS changes take time to propagate worldwide:

- Minimum: 5 minutes
- Average: 15 minutes
- Maximum: 48 hours (rare)

**What to do while waiting**:

- ☕ Take a coffee break
- 📧 Test email delivery (might work already!)
- 🎨 Continue with Phase 4 UX improvements

### Step 7: Verify DNS Records (2 minutes)

**Option A: Use DNS Checker**

1. Go to: https://dnschecker.org
2. Enter domain: `justforview.in`
3. Select record type: `TXT`
4. Click "Search"
5. You should see both SPF and DKIM records

**Option B: Use Command Line**

```powershell
# Check SPF record
nslookup -type=TXT justforview.in

# Check DKIM record
nslookup -type=TXT resend._domainkey.justforview.in

# Check MX record
nslookup -type=MX justforview.in
```

Look for:

- ✅ SPF: `v=spf1 include:_spf.resend.com ~all`
- ✅ DKIM: Long string starting with `p=`
- ✅ MX: `feedback-smtp.resend.com` with priority 10

### Step 8: Verify in Resend Dashboard (1 minute)

1. Go back to: https://resend.com/domains
2. Find "justforview.in"
3. Click "Verify Domain"
4. Wait for verification (might take a minute)
5. Status should change to: **✅ Verified**

---

## 📋 Common Domain Registrar Instructions

### GoDaddy

1. Log in to GoDaddy
2. Go to "My Products" → "Domains"
3. Click domain name → "Manage DNS"
4. Scroll to "Records" section
5. Click "Add" for each record
6. Select type (TXT or MX)
7. Fill in details and save

### Namecheap

1. Log in to Namecheap
2. Go to "Domain List"
3. Click "Manage" next to domain
4. Go to "Advanced DNS" tab
5. Click "Add New Record"
6. Select type and fill in details
7. Save changes

### Cloudflare

1. Log in to Cloudflare
2. Select domain from dashboard
3. Go to "DNS" section
4. Click "Add record"
5. Select type (TXT or MX)
6. Fill in details
7. Click "Save"

**Note**: Cloudflare DNS propagates quickly (1-2 minutes)

### Google Domains

1. Log in to Google Domains
2. Select domain
3. Go to "DNS" tab
4. Scroll to "Custom resource records"
5. Add each record
6. Click "Add"

---

## ⚠️ Troubleshooting

### Issue: "Record already exists"

**Cause**: You might have existing SPF or MX records

**Solution**:

- For SPF: Merge with existing (e.g., `v=spf1 include:_spf.resend.com include:other.com ~all`)
- For MX: Add as additional MX record with different priority
- For DKIM: Should not conflict (unique subdomain)

### Issue: DNS not propagating after 1 hour

**Solutions**:

1. Check TTL value - lower = faster propagation
2. Clear your DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
3. Try different DNS checker: https://mxtoolbox.com
4. Contact domain registrar support

### Issue: DKIM value too long

**Solutions**:

- Some registrars have character limits
- Try splitting into multiple TXT records (check registrar docs)
- Contact registrar support for help
- Use Cloudflare DNS (no limits)

### Issue: Verification fails in Resend

**Solutions**:

1. Wait longer (up to 30 minutes)
2. Double-check record values (no typos)
3. Ensure you used exact DKIM value from dashboard
4. Check DNS propagation status
5. Contact Resend support: support@resend.com

---

## ✅ Verification Checklist

After adding DNS records, verify:

- [ ] SPF record added and visible in DNS checker
- [ ] DKIM record added and visible in DNS checker
- [ ] MX record added and visible in DNS checker
- [ ] DNS propagation complete (check dnschecker.org)
- [ ] Resend dashboard shows domain as "Verified"
- [ ] Test email lands in inbox (not spam)
- [ ] No DNS errors in logs

---

## 📊 Impact Analysis

### Before DNS Setup:

- 📉 Deliverability: ~60-70%
- 📨 Inbox placement: ~40%
- ⚠️ Spam folder: ~60%
- 🔴 Sender reputation: Unverified

### After DNS Setup:

- 📈 Deliverability: >95%
- 📬 Inbox placement: >90%
- ✅ Spam folder: <5%
- 🟢 Sender reputation: Verified

**Bottom Line**: DNS setup is CRITICAL for email delivery success!

---

## 🎯 Success Criteria

DNS setup is **COMPLETE** when:

- ✅ All 3 records added to domain registrar
- ✅ DNS propagation complete
- ✅ Records visible in DNS checker
- ✅ Resend dashboard shows "Verified"
- ✅ Test emails land in inbox (not spam)

---

## 📞 Support Resources

### DNS Help

- DNS Checker: https://dnschecker.org
- MX Toolbox: https://mxtoolbox.com
- What's My DNS: https://www.whatsmydns.net

### Domain Registrar Support

- GoDaddy: https://www.godaddy.com/help
- Namecheap: https://www.namecheap.com/support
- Cloudflare: https://support.cloudflare.com
- Google Domains: https://support.google.com/domains

### Resend Support

- Docs: https://resend.com/docs/dashboard/domains/introduction
- Email: support@resend.com
- Status: https://status.resend.com

---

## 🚀 Quick Commands Reference

```powershell
# Check SPF record
nslookup -type=TXT justforview.in

# Check DKIM record
nslookup -type=TXT resend._domainkey.justforview.in

# Check MX record
nslookup -type=MX justforview.in

# Flush DNS cache (Windows)
ipconfig /flushdns

# Flush DNS cache (Mac)
sudo dscacheutil -flushcache

# Test email after DNS setup
# Use Resend's email test tool or send test auction email
```

---

**Ready to add DNS records?** Follow the step-by-step guide above!

**Estimated time**: 15 minutes active work + 5-30 min DNS propagation

Good luck! 🚀
