# Deployment Scripts Reference

Quick reference for deployment and configuration management scripts.

## 🔥 Firebase Deployment

### Deploy Firestore Indices

```powershell
.\scripts\deploy-firestore-indices.ps1
```

Deploys composite indices from `firestore.indexes.json` to Firestore.

**What it does:**

- Validates Firebase CLI installation
- Shows current project
- Prompts for confirmation
- Deploys indices
- Provides status links

**Time:** Index creation can take 5-10 minutes

---

### Deploy Firebase Rules

```powershell
.\scripts\deploy-firestore-rules.ps1
```

Deploys all security rules to Firebase:

- Firestore rules (`firestore.rules`)
- Storage rules (`storage.rules`)
- Realtime Database rules (`database.rules.json`)

**What it does:**

- Validates Firebase CLI installation
- Shows current project
- Lists all rules files
- Prompts for confirmation
- Deploys all rules simultaneously

---

### Check Firestore Status

```powershell
.\scripts\check-firestore-status.ps1
```

Displays current Firestore configuration and index status.

**What it shows:**

- Current Firebase project
- All existing indices
- Index build status
- Quick links to Firebase Console

**Use this to:**

- Monitor index creation progress
- Verify deployment success
- Check current configuration

---

## ▲ Vercel Deployment

### Sync Environment Variables to Vercel

```powershell
# Sync all variables to all environments
.\scripts\sync-env-to-vercel.ps1

# Dry run (preview without changes)
.\scripts\sync-env-to-vercel.ps1 -DryRun

# Sync to specific environment
.\scripts\sync-env-to-vercel.ps1 -Environment "production"
.\scripts\sync-env-to-vercel.ps1 -Environment "preview"
.\scripts\sync-env-to-vercel.ps1 -Environment "production,preview"
```

Reads `.env.local` and syncs all variables to Vercel.

**What it does:**

1. Parses `.env.local` file
2. Lists all variables found
3. Prompts for confirmation
4. For each variable:
   - Removes existing value if present
   - Adds new value to specified environments
5. Reports success/failure for each variable

**Options:**

- `-DryRun` - Preview changes without applying
- `-Environment` - Target environment(s): "production", "preview", "development" (comma-separated)
- `-EnvFile` - Custom env file path (default: `.env.local`)

**Example output:**

```
Found 16 environment variables

This will sync variables to Vercel environments: production,preview,development
Continue? (y/N): y

Processing: NEXT_PUBLIC_FIREBASE_API_KEY
  Removing existing variable...
  Adding variable to: production,preview,development
  [SUCCESS] NEXT_PUBLIC_FIREBASE_API_KEY synced

[SUCCESS] 15 variables synced
[FAILED]  1 variables failed
```

---

### Pull Environment Variables from Vercel

```powershell
# Pull from development environment
.\scripts\pull-env-from-vercel.ps1

# Pull from specific environment
.\scripts\pull-env-from-vercel.ps1 -Environment "production"

# Save to custom file
.\scripts\pull-env-from-vercel.ps1 -OutputFile ".env.production"
```

Downloads environment variables from Vercel to a local file.

**What it does:**

- Connects to Vercel
- Downloads variables from specified environment
- Saves to `.env.vercel` (or custom file)
- Shows count of variables downloaded

**Use this to:**

- Sync Vercel config to local environment
- Backup environment variables
- Clone configuration to new developers

---

### List Vercel Environment Variables

```powershell
.\scripts\list-vercel-env.ps1
```

Displays all environment variables configured in Vercel.

**What it shows:**

- Variable names
- Which environments each is applied to
- Helpful CLI command examples

**Use this to:**

- Audit environment configuration
- Verify variables are set correctly
- Check which environments have which variables

---

## 📋 Typical Workflows

### Initial Project Setup

```powershell
# 1. Deploy Firebase configuration
.\scripts\deploy-firestore-indices.ps1
.\scripts\deploy-firestore-rules.ps1

# 2. Sync environment variables to Vercel
.\scripts\sync-env-to-vercel.ps1

# 3. Verify everything is deployed
.\scripts\check-firestore-status.ps1
.\scripts\list-vercel-env.ps1
```

---

### Adding New Environment Variables

```powershell
# 1. Add to .env.local locally
notepad .env.local

# 2. Test locally
npm run dev

# 3. Preview what will be synced
.\scripts\sync-env-to-vercel.ps1 -DryRun

# 4. Sync to Vercel
.\scripts\sync-env-to-vercel.ps1
```

---

### Updating Firestore Indices

```powershell
# 1. Edit firestore.indexes.json
notepad firestore.indexes.json

# 2. Deploy indices
.\scripts\deploy-firestore-indices.ps1

# 3. Monitor build progress
.\scripts\check-firestore-status.ps1
# (Run this periodically until all indices show as "READY")
```

---

### Syncing Team Member Configuration

```powershell
# New team member setup:

# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Link to project
vercel link

# 4. Pull environment variables
.\scripts\pull-env-from-vercel.ps1

# 5. Copy to .env.local
copy .env.vercel .env.local

# 6. Start development
npm run dev
```

---

## 🔧 Troubleshooting

### "Firebase CLI not found"

```powershell
npm install -g firebase-tools
firebase login
```

### "Vercel CLI not found"

```powershell
npm install -g vercel
vercel login
```

### "Index creation failed"

1. Check `firestore.indexes.json` for syntax errors
2. Verify you're authenticated: `firebase login`
3. Check you're targeting correct project: `firebase use`
4. Review error message and fix JSON structure

### "Environment variable sync failed"

1. Ensure you're logged in: `vercel login`
2. Check you're in correct project directory
3. Verify `.env.local` file exists and is readable
4. Try syncing one variable at a time manually:
   ```powershell
   vercel env add VARIABLE_NAME production
   ```

### "Permission denied"

```powershell
# Enable script execution (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🌱 Database Seeding

### Seed All Data

```powershell
npx ts-node scripts/seed-all-data.ts
```

Seeds all collections with sample data for development and testing.

**What it seeds:**

- Users (Auth + Firestore)
- Categories (hierarchical structure)
- Products (regular + auction items)
- Orders (various statuses)
- Reviews (approved, pending, rejected)
- Coupons (percentage, fixed, free shipping, BOGO)
- Carousel Slides (homepage hero)
- Homepage Sections (configurable sections)
- Site Settings (global config)
- FAQs (common questions)

**Options:**

```powershell
# Seed specific collections only
npx ts-node scripts/seed-all-data.ts --collections=users,products,categories

# Dry run (preview without changes)
npx ts-node scripts/seed-all-data.ts --dry-run

# Verbose output
npx ts-node scripts/seed-all-data.ts --verbose

# Combine options
npx ts-node scripts/seed-all-data.ts --collections=users,products --dry-run -v
```

**⚠️ Warning:** This will overwrite existing data. Use with caution!

---

### Individual Seed Scripts

Seed data files are located in `scripts/seed-data/`:

- `users-seed-data.ts` - Sample users (admin, customers, sellers)
- `categories-seed-data.ts` - Hierarchical category tree
- `products-seed-data.ts` - Products across categories
- `orders-seed-data.ts` - Orders with various statuses
- `reviews-seed-data.ts` - Product reviews
- `coupons-seed-data.ts` - Discount coupons
- `carousel-slides-seed-data.ts` - Homepage carousel
- `homepage-sections-seed-data.ts` - Homepage sections config
- `site-settings-seed-data.ts` - Global site settings
- `faq-seed-data.ts` - FAQs

**Import seed data:**

```typescript
import {
  usersSeedData,
  categoriesSeedData,
  productsSeedData,
  // ... other seed data
} from "./seed-data";
```

---

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

---

## 🔐 Security Notes

- **Never commit `.env.local` or `.env.vercel` to git**
- Always use environment-specific values (dev vs prod)
- Rotate sensitive keys regularly
- Review Vercel environment variable access logs
- Use least-privilege principle for API keys
- **Seed data is for development only** - Do not use in production
