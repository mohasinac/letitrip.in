# 🎯 Deployment Checklist

Use this checklist before deploying to production.

## ✅ Pre-Deployment

### Environment Setup

- [ ] Created `.env.production` from `.env.production.example`
- [ ] Updated `NEXT_PUBLIC_APP_URL=https://hobbiesspot.com`
- [ ] Generated secure `JWT_SECRET` (min 32 chars): `openssl rand -base64 32`
- [ ] Added Firebase Admin SDK private key
- [ ] Changed Razorpay to **LIVE** keys (not test keys)
- [ ] Set `NODE_ENV=production`

### Firebase Configuration

- [ ] Firebase project created/verified
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created
- [ ] Storage bucket configured
- [ ] Downloaded Service Account Key
- [ ] Added `hobbiesspot.com` to Authorized Domains
- [ ] Deployed Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deployed Storage rules: `firebase deploy --only storage:rules`
- [ ] Applied CORS: `gsutil cors set cors.json gs://your-bucket`

### Code Quality

- [ ] All tests passing
- [ ] No console errors in browser
- [ ] Build succeeds: `npm run build`
- [ ] Type check passes: `npm run type-check` (warnings OK)
- [ ] All changes committed to Git
- [ ] Code reviewed and approved

### Security

- [ ] All `.env*` files in `.gitignore`
- [ ] No API keys in client code
- [ ] CORS properly configured
- [ ] Firebase rules are restrictive
- [ ] Rate limiting implemented
- [ ] Security headers configured

---

## 🚀 Vercel Deployment

### Initial Setup

- [ ] Vercel account created
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Logged in: `vercel login`
- [ ] Repository connected to Vercel

### Deployment Steps

```powershell
# 1. Run pre-deployment checks
npm run deploy:check

# 2. Deploy to Vercel
npm run deploy:setup

# Or manually:
vercel --prod
```

### Environment Variables

- [ ] All env vars from `.env.production` added to Vercel
- [ ] Used Vercel Dashboard: Settings → Environment Variables
- [ ] Or used script: `npm run vercel:env-sync`
- [ ] Verified sensitive vars are secret

### Domain Configuration

- [ ] Domain `hobbiesspot.com` added in Vercel
- [ ] Domain `www.hobbiesspot.com` added in Vercel
- [ ] DNS A record: `@` → `76.76.21.21`
- [ ] DNS CNAME record: `www` → `cname.vercel-dns.com`
- [ ] SSL certificate issued (automatic)
- [ ] HTTPS redirect enabled

---

## 🔌 Render.com (Socket.io)

### Setup

- [ ] Render account created
- [ ] New Web Service created
- [ ] GitHub repo connected
- [ ] Build command: `npm install`
- [ ] Start command: `node server.js`
- [ ] Environment variables added
- [ ] Health check endpoint: `/health`

### Configuration

- [ ] Service deployed successfully
- [ ] URL noted: `https://hobbiesspot-socket.onrender.com`
- [ ] Added `NEXT_PUBLIC_SOCKET_URL` to Vercel env vars
- [ ] Redeployed Vercel after adding Socket URL
- [ ] Tested Socket connection from frontend

### Production Considerations

- [ ] Upgraded to Starter plan ($7/month) for always-on
- [ ] Or: Implemented wake-up ping for free tier
- [ ] Auto-deploy from main branch enabled
- [ ] Logs monitoring set up

---

## 🎨 SEO & Analytics

### SEO Setup

- [ ] Sitemap accessible: `https://hobbiesspot.com/sitemap.xml`
- [ ] Robots.txt accessible: `https://hobbiesspot.com/robots.txt`
- [ ] Meta tags on all pages
- [ ] Open Graph images configured
- [ ] Twitter Cards configured
- [ ] Structured data implemented

### Search Console

- [ ] Google Search Console account created
- [ ] Property added: `hobbiesspot.com`
- [ ] Ownership verified
- [ ] Sitemap submitted
- [ ] Coverage report checked

### Testing Tools

- [ ] Google Rich Results: https://search.google.com/test/rich-results
- [ ] Facebook Debugger: https://developers.facebook.com/tools/debug
- [ ] Twitter Validator: https://cards-dev.twitter.com/validator
- [ ] Lighthouse score > 90

### Analytics (Optional)

- [ ] Google Analytics configured
- [ ] Vercel Analytics enabled
- [ ] Error tracking set up (Sentry)
- [ ] Uptime monitoring configured

---

## 🧪 Post-Deployment Testing

### Functionality Tests

- [ ] **Homepage loads**: https://hobbiesspot.com
- [ ] **Authentication**:
  - [ ] Sign up works
  - [ ] Login works
  - [ ] Logout works
  - [ ] Password reset works
- [ ] **Products**:
  - [ ] Product list displays
  - [ ] Product details load
  - [ ] Search works
  - [ ] Filtering works
- [ ] **Shopping**:
  - [ ] Add to cart
  - [ ] Update cart quantities
  - [ ] Remove from cart
  - [ ] Cart persists
- [ ] **Checkout**:
  - [ ] Address form works
  - [ ] Payment gateway loads
  - [ ] Order placement works
  - [ ] Order confirmation received
- [ ] **Media**:
  - [ ] Images load correctly
  - [ ] Image upload works
  - [ ] Video upload works (if applicable)
- [ ] **Real-time**:
  - [ ] Socket.io connects
  - [ ] Real-time updates work
  - [ ] No disconnection issues

### Performance Tests

- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] Total Blocking Time < 200ms

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Security Tests

- [ ] HTTPS enabled everywhere
- [ ] No mixed content warnings
- [ ] Security headers present: https://securityheaders.com
- [ ] No exposed API keys in DevTools
- [ ] CORS working correctly
- [ ] API authentication working

---

## 📊 Monitoring Setup

### Logging

- [ ] Vercel logs accessible
- [ ] Render logs accessible
- [ ] Firebase logs monitored
- [ ] Error tracking configured

### Alerts

- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Error rate alerts
- [ ] Performance degradation alerts
- [ ] Quota usage alerts (Firebase)

### Backups

- [ ] Firebase database backup scheduled
- [ ] Environment variables backed up securely
- [ ] Critical data export automated

---

## 🎉 Launch Checklist

### Final Steps

- [ ] All above items completed
- [ ] Stakeholders notified
- [ ] Documentation updated
- [ ] Support team briefed
- [ ] Social media prepared
- [ ] Email campaigns ready

### Launch Day

- [ ] Monitor error logs closely
- [ ] Watch performance metrics
- [ ] Test all critical paths
- [ ] Be ready to rollback if needed
- [ ] Communicate with users

### Post-Launch

- [ ] Monitor first 24 hours closely
- [ ] Collect user feedback
- [ ] Fix critical issues immediately
- [ ] Document lessons learned
- [ ] Celebrate! 🎊

---

## 🆘 Emergency Procedures

### Rollback

```powershell
# Vercel rollback to previous deployment
vercel rollback
```

### Quick Disable

```powershell
# Enable maintenance mode
vercel env add NEXT_PUBLIC_MAINTENANCE_MODE true production
vercel --prod
```

### Emergency Contacts

- **Vercel Support**: support@vercel.com
- **Render Support**: support@render.com
- **Firebase Support**: Console → Support
- **Domain Registrar**: (your registrar's support)

---

## 📋 Deployment Scripts

Use these npm scripts for deployment:

```powershell
# Pre-deployment checks
npm run deploy:check

# Deploy to Vercel (interactive)
npm run deploy:setup

# Deploy to production
npm run deploy:production

# Deploy preview
npm run deploy:preview

# Sync environment variables
npm run vercel:env-sync

# Build locally
npm run build

# Type check
npm run type-check
```

---

**Last Updated**: October 31, 2025
**Application**: HobbiesSpot (hobbiesspot.com)
**Version**: 1.0.0
