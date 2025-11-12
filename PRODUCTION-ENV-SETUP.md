# Production Environment Setup

## Critical Environment Variables for Vercel

When deploying to production, ensure these environment variables are set in Vercel:

### Required for API Routes

```bash
# IMPORTANT: Set this to your production URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# This allows server-side API calls to work properly
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Why This Matters

The `api.service.ts` converts relative API URLs to absolute URLs in server-side contexts:

```typescript
if (typeof window === "undefined" && !url.startsWith("http")) {
  const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  url = `${host}${url}`;
}
```

Without proper `NEXT_PUBLIC_APP_URL`, server-side rendering will fail to fetch data.

## Setting Environment Variables in Vercel

### Via CLI:

```powershell
# Set the production URL
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-domain.vercel.app

# Or use the bulk script
.\scripts\set-vercel-env-from-local.ps1
```

### Via Vercel Dashboard:

1. Go to your project settings
2. Navigate to Environment Variables
3. Add `NEXT_PUBLIC_APP_URL` with your production URL
4. Add it to all environments (Production, Preview, Development)

## Local Development

For local development, `.env.local` already has:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Fixed Issues

### 1. Unauthorized Errors on Public Pages
- **Problem**: Homepage API routes required authentication
- **Solution**: Made public routes (products, shops, categories, blog) work without authentication
- **Files Changed**: 
  - `src/app/api/products/route.ts`
  - `src/app/api/shops/route.ts`

### 2. Missing Query Errors
- **Problem**: Firestore compound queries require composite indexes
- **Solution**: Simplified queries to use single filters and sort/filter in memory
- **Files Changed**:
  - `src/app/api/categories/homepage/route.ts`
  - `src/app/api/blog/route.ts`
  - `src/app/api/shops/route.ts`
  - `src/app/api/lib/firebase/queries.ts`

### 3. toISOString Errors
- **Problem**: Some date fields were undefined
- **Solution**: These will be handled by proper null checks in the components

## Testing the Fixes

1. Start dev server: `npm run dev`
2. Visit homepage: `http://localhost:3000`
3. Check browser console - should have no errors
4. Check Network tab - all API calls should return 200

## Deploying to Production

```powershell
# 1. Set environment variables
vercel env add NEXT_PUBLIC_APP_URL production

# 2. Deploy
npm run build
vercel --prod
```
