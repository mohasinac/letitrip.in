# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites

- Vercel CLI installed: `npm i -g vercel`
- Logged into Vercel: `vercel login`

### Deployment Scripts

We've simplified deployment to production-only (no preview builds):

```bash
# Deploy to production (simplest)
npm run deploy

# Build locally first, then deploy
npm run deploy:build

# Sync environment variables, then deploy
npm run deploy:env
```

### Environment Variables

Before deploying, ensure all environment variables are set on Vercel:

```bash
# Sync from .env.local to Vercel production
npm run vercel:env

# Dry run to see what would be synced
npm run vercel:env:dry-run
```

### Manual Deployment

If you prefer manual control:

```bash
# 1. Build locally to verify
npm run build

# 2. Deploy to production
vercel --prod
```

### Required Environment Variables

Ensure these are set in Vercel Dashboard or via CLI:

#### Firebase Admin

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

#### Firebase Client (Public)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Session & Security

- `SESSION_SECRET` (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `JWT_SECRET`

#### Optional Services

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SHIPROCKET_EMAIL`
- `SHIPROCKET_PASSWORD`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`

### Vercel Configuration

The project is configured via `vercel.json`:

- Region: Mumbai (bom1) for India-optimized performance
- Memory: 1024MB for API functions
- Max Duration: 10s per function
- Framework: Next.js (detected automatically)

### Troubleshooting

#### Build Fails

1. Test build locally: `npm run build`
2. Check TypeScript errors: `npm run type-check`
3. Review Vercel logs: `vercel logs <deployment-url>`

#### Missing Environment Variables

```bash
# List current Vercel env vars
vercel env ls

# Add a new env var
vercel env add VARIABLE_NAME production
```

#### Production URL

After deployment, your production URL will be:

- Primary: `https://letitrip-in.vercel.app`
- Custom: Configure in Vercel Dashboard under Domains

### CI/CD with GitHub

To enable automatic deployments:

1. Connect repository in Vercel Dashboard
2. Set up environment variables in Vercel
3. Configure branch deployments (main → production)
4. Disable preview deployments if desired

### Performance Optimization

The build includes:

- Static page generation where possible
- Dynamic routes for user-specific content
- Image optimization via Next.js
- SWC minification enabled
- Optimized package imports (Lucide, Recharts)

### Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Local build succeeds: `npm run build`
- [ ] Type checking passes: `npm run type-check`
- [ ] Firebase rules deployed: `npm run setup:firebase-rules`
- [ ] Environment variables synced: `npm run vercel:env`
- [ ] Test deployment: `npm run deploy`
- [ ] Verify production URL works
- [ ] Check error monitoring (Vercel Dashboard)
- [ ] Configure custom domain (optional)

### Post-Deployment

Monitor your deployment:

- Vercel Dashboard: https://vercel.com/dashboard
- Analytics: Enable in Vercel project settings
- Logs: Real-time via `vercel logs <url> --follow` (deprecated, use dashboard)

### Support

For issues:

1. Check build logs in Vercel Dashboard
2. Review this deployment guide
3. Test locally first: `npm run build && npm start`
4. Check Firebase configuration
5. Verify environment variables are set correctly
