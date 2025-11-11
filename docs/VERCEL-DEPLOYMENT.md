# Automated Vercel Production Deployment

Automatically update environment variables and deploy to Vercel production with a single command.

## Prerequisites

- Node.js installed
- Vercel account
- Project configured on Vercel

## Quick Start

### 1. Full Automated Deployment (Recommended)

Updates all environment variables from `.env.production` and deploys:

```powershell
npm run deploy:prod
```

Or run directly:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-to-vercel-prod.ps1
```

### 2. Deploy Without Updating Environment Variables

If environment variables are already set:

```powershell
npm run deploy:prod:skip-env
```

### 3. Force Deployment

Continue deployment even if some environment variables fail:

```powershell
npm run deploy:prod:force
```

## What the Script Does

1. ✅ **Checks Vercel CLI Installation**

   - Automatically installs Vercel CLI if not found

2. ✅ **Links Project to Vercel**

   - Links the project if not already linked

3. ✅ **Updates Environment Variables**

   - Reads all variables from `.env.production`
   - Removes existing production environment variables
   - Adds new environment variables to Vercel production
   - Shows success/failure count for each variable

4. ✅ **Deploys to Production**
   - Runs `vercel --prod --yes`
   - Shows deployment status and results

## Environment Variables

The script reads from `.env.production` and automatically updates all variables in Vercel production environment.

**Current Variables:**

- Firebase configuration (Admin & Client SDK)
- API configuration
- Session secrets
- Feature flags
- Optional integrations (Discord, Analytics)

## Command Options

### PowerShell Script Options

```powershell
# Skip environment variable update
.\scripts\deploy-to-vercel-prod.ps1 -SkipEnvUpdate

# Force deployment even if env vars fail
.\scripts\deploy-to-vercel-prod.ps1 -Force

# Combine both options
.\scripts\deploy-to-vercel-prod.ps1 -SkipEnvUpdate -Force
```

### Bash Script Options (Unix/Linux/Mac)

```bash
# Full deployment
bash scripts/deploy-to-vercel-prod.sh

# Skip environment variable update
bash scripts/deploy-to-vercel-prod.sh --skip-env-update

# Force deployment
bash scripts/deploy-to-vercel-prod.sh --force
```

## First Time Setup

If this is your first deployment:

1. **Install Vercel CLI** (if not installed):

   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**:

   ```powershell
   vercel login
   ```

3. **Link Your Project**:

   ```powershell
   vercel link
   ```

   - Select your team
   - Select your project
   - Link to `./` directory

4. **Run Deployment**:
   ```powershell
   npm run deploy:prod
   ```

## Troubleshooting

### Vercel CLI Not Found

```powershell
npm install -g vercel
```

### Project Not Linked

The script will automatically prompt you to link the project. Or run manually:

```powershell
vercel link
```

### Environment Variable Errors

- Check `.env.production` file exists
- Verify all required variables are set
- Ensure no syntax errors in environment file
- Check for special characters that need escaping

### Deployment Fails

1. **Build Errors**: Check code for TypeScript/compilation errors

   ```powershell
   npm run build
   ```

2. **Missing Dependencies**:

   ```powershell
   npm install
   ```

3. **Environment Variables**: Verify in Vercel dashboard
   - Go to: Settings → Environment Variables

### Permission Errors (Windows)

If you get execution policy errors:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Manual Deployment

If you prefer manual control:

```powershell
# 1. Update environment variables manually
vercel env pull .env.vercel.production

# 2. Deploy to production
vercel --prod
```

## Vercel Dashboard

After deployment, monitor your application:

- **Dashboard**: https://vercel.com/dashboard
- **Deployment URL**: Check output after deployment
- **Logs**: View real-time logs in Vercel dashboard
- **Analytics**: Monitor performance and usage

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Vercel Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Deploy to Production
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: bash scripts/deploy-to-vercel-prod.sh --skip-env-update
```

### Required GitHub Secrets

Add these in GitHub Settings → Secrets and variables → Actions:

- `VERCEL_TOKEN`: Create in Vercel → Settings → Tokens
- `VERCEL_ORG_ID`: Found in `.vercel/project.json`
- `VERCEL_PROJECT_ID`: Found in `.vercel/project.json`

## Best Practices

1. **Always test locally first**:

   ```powershell
   npm run build
   npm start
   ```

2. **Review environment variables**:

   - Check `.env.production` before deployment
   - Ensure no sensitive data in version control
   - Use strong session secrets

3. **Monitor after deployment**:

   - Check deployment logs
   - Test critical features
   - Monitor error rates

4. **Rollback if needed**:
   - Go to Vercel dashboard
   - Select previous deployment
   - Click "Promote to Production"

## Security Notes

⚠️ **Important Security Reminders:**

- Never commit `.env.production` to version control
- Keep Firebase private keys secure
- Use strong session secrets (32+ characters)
- Rotate secrets regularly
- Use Vercel's secret encryption

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **GitHub Issues**: Report bugs in your repository

## Summary

This automated deployment script saves time and reduces errors by:

- Automatically updating all environment variables
- Handling Vercel CLI installation
- Providing clear status updates
- Supporting both PowerShell and Bash
- Including error handling and validation

**One command deploys everything:**

```powershell
npm run deploy:prod
```
