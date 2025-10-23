# Deployment Guide - Static Build with Firebase Backend

Since your project uses API routes that require server-side functionality, we have a few hosting options:

## Option 1: Deploy to Vercel (Recommended for Full-Stack Apps)

Vercel natively supports Next.js with API routes:

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Follow the prompts and your site will be deployed
```

## Option 2: Deploy to Netlify

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

## Option 3: Static Build (Firebase Hosting - No API Routes)

For a static build, we need to modify the app to use Firebase directly:

```powershell
# Build for static export
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

**Note**: This removes server-side API functionality and uses Firebase directly from the client.

## Option 4: Full Firebase Setup (Functions + Hosting)

Convert API routes to Firebase Functions:

1. Install Firebase Functions:

```powershell
firebase init functions
```

2. Move API logic to Firebase Functions
3. Deploy both functions and hosting:

```powershell
firebase deploy
```

## Current Configuration

Your project is currently configured for **Option 3** (Static Build).

### To deploy immediately:

```powershell
npm run deploy
```

This will:

1. Build the Next.js app as a static export
2. Deploy to Firebase Hosting
3. Your site will be available at: https://justforview1.web.app

### Environment Variables for Production

Make sure these are set in your production environment:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `FIREBASE_ADMIN_PRIVATE_KEY` (for server functions)

### Post-Deployment Steps

1. Update Firebase Security Rules if needed
2. Test all functionality
3. Set up monitoring and analytics
4. Configure custom domain if required

Choose the option that best fits your needs!
