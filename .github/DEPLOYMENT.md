# GitHub Actions & Vercel Setup

## Overview

This repository is configured with automatic Vercel deployment through GitHub Actions. Every push to any branch will trigger a deployment.

## GitHub Secrets Configuration

To set up automatic deployments, you need to configure the following secrets in your GitHub repository:

### Required Secrets

1. **VERCEL_TOKEN**
   - Go to Vercel Dashboard → Settings → Tokens
   - Create a new token with appropriate scope
   - Add this to GitHub Secrets

2. **VERCEL_ORG_ID**
   - Run `vercel link` in your project locally
   - Check `.vercel/project.json` for the `orgId`
   - Add this to GitHub Secrets

3. **VERCEL_PROJECT_ID**
   - Run `vercel link` in your project locally
   - Check `.vercel/project.json` for the `projectId`
   - Add this to GitHub Secrets

### How to Add Secrets to GitHub

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the exact names above

## Deployment Behavior

- **Main branch**: Deploys to production
- **Other branches**: Deploys to preview environments
- **Pull requests**: Creates preview deployments with comment links

## Local Development

To link your local development environment:

```bash
# Install Vercel CLI
npm install -g vercel

# Link your project
vercel link

# Pull environment variables (optional)
vercel env pull .env.local
```

## Workflow Features

- ✅ Automatic deployment on every push
- ✅ Production deployment for main branch
- ✅ Preview deployments for feature branches
- ✅ PR comment with deployment URLs
- ✅ Deployment status updates
- ✅ Build caching for faster deployments

## Troubleshooting

If deployments fail:

1. Check GitHub Actions logs
2. Verify all secrets are correctly set
3. Ensure `vercel.json` configuration is valid
4. Check Vercel dashboard for additional error details

## Manual Deployment

You can also deploy manually using:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```
