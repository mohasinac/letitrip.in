# Migration Checklist: JustForView → Letitrip

## ✅ Completed Tasks

### Repository & Project Setup

- [x] Repository renamed to `letitrip.in`
- [x] GitHub URL updated: https://github.com/mohasinac/letitrip.in
- [x] Firebase project created: `letitrip-in-app`
- [x] Package.json updated with new name and repository

### Environment Files

- [x] `.env.local` created with new Firebase credentials
- [x] `.env.production` created for production deployment
- [x] `.env.local.example` updated with new configuration template
- [x] `.gitignore` updated to exclude sensitive files

### Firebase Configuration

- [x] `firebase.json` updated with all services
- [x] `firestore.rules` configured with security rules
- [x] `firestore.indexes.json` configured with all necessary indexes
- [x] `storage.rules` configured with storage security
- [x] `database.rules.json` created for Realtime Database

### Vercel Configuration

- [x] `vercel.json` updated for Mumbai region (bom1)
- [x] Environment variables template prepared
- [x] GitHub integration references updated

### Scripts Created

- [x] `scripts/deploy-firebase.ps1` - PowerShell Firebase deployment
- [x] `scripts/deploy-firebase.sh` - Unix/Linux Firebase deployment
- [x] `scripts/setup-vercel-env.ps1` - PowerShell Vercel setup helper
- [x] `scripts/setup-vercel-env.sh` - Unix/Linux Vercel setup helper

### Documentation

- [x] `DEPLOYMENT-GUIDE.md` created with comprehensive setup instructions
- [x] `README.md` updated with new project details
- [x] Migration checklist created (this file)

## 🔄 Pending Tasks

### Firebase Deployment

- [ ] Run `npm run deploy:firebase` to deploy Firebase rules and indexes
- [ ] Enable Email/Password authentication in Firebase Console
- [ ] Verify Firestore Database creation
- [ ] Verify Storage bucket creation
- [ ] Verify Realtime Database creation
- [ ] Test Firebase Admin SDK connection

### Vercel Deployment

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Run `vercel login` to authenticate
- [ ] Link project: `vercel link`
- [ ] Set up environment variables (use `npm run setup:vercel` for guidance)
- [ ] Deploy to preview: `vercel`
- [ ] Deploy to production: `vercel --prod`

### Environment Variables Setup

- [ ] Generate secure SESSION_SECRET
- [ ] Add all environment variables to Vercel Dashboard
- [ ] Verify FIREBASE_PRIVATE_KEY formatting in Vercel
- [ ] Test environment variables in preview deployment

### Testing

- [ ] Test local development: `npm run dev`
- [ ] Test Firebase Admin SDK initialization
- [ ] Test Firebase client-side authentication
- [ ] Test Firestore read/write operations
- [ ] Test Storage file uploads
- [ ] Test Realtime Database connections
- [ ] Test API endpoints
- [ ] Test auction real-time features

### Domain Configuration (Optional)

- [ ] Add custom domain in Vercel: `letitrip.in`
- [ ] Configure DNS records
- [ ] Enable automatic HTTPS
- [ ] Test domain accessibility

### Security & Monitoring

- [ ] Review and test Firestore security rules
- [ ] Review and test Storage security rules
- [ ] Review and test Database security rules
- [ ] Set up Firebase usage alerts
- [ ] Set up Vercel deployment notifications
- [ ] Configure error tracking (Sentry, if used)

### Data Migration (If Needed)

- [ ] Export data from old Firebase project
- [ ] Import data to new Firebase project
- [ ] Verify data integrity
- [ ] Update user authentication records

### Clean Up

- [ ] Remove old Firebase service account JSON files
- [ ] Remove old deployment scripts (if any)
- [ ] Remove old environment files
- [ ] Update any hardcoded references to old URLs

## 📋 Quick Commands Reference

### Firebase

```powershell
# Deploy all Firebase services
npm run deploy:firebase

# Or deploy individually
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
firebase deploy --only database
```

### Vercel

```powershell
# Get environment setup commands
npm run setup:vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Development

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔗 Important Links

- **GitHub Repository**: https://github.com/mohasinac/letitrip.in
- **Firebase Console**: https://console.firebase.google.com/project/letitrip-in-app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Project Documentation**: See DEPLOYMENT-GUIDE.md

## ⚠️ Important Notes

1. **Never commit sensitive data**:

   - Firebase service account JSON files
   - Private keys
   - Environment files with real credentials
   - Session secrets

2. **Environment Variables**:

   - `.env.local` is for local development only
   - `.env.production` template for Vercel environment
   - Always use Vercel Dashboard or CLI for production secrets

3. **Firebase Private Key**:

   - Must include `\n` for line breaks in the private key
   - Enclose entire key in double quotes
   - Test locally before deploying to Vercel

4. **Security Rules**:
   - Test Firestore rules before production deployment
   - Verify Storage rules prevent unauthorized uploads
   - Monitor Firebase usage for suspicious activity

## 🎯 Next Steps After Deployment

1. Create admin user in Firebase Console
2. Seed initial categories and data
3. Test complete user flow (registration → purchase)
4. Set up monitoring and alerts
5. Configure backup strategy
6. Document API endpoints
7. Set up CI/CD pipeline (optional)

## 📞 Support

For issues or questions:

- Check DEPLOYMENT-GUIDE.md
- Review Firebase Console logs
- Check Vercel deployment logs
- Review application logs in `/logs` directory
