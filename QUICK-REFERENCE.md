# 🚀 Letitrip.in - Quick Reference Card

## 📍 Domain & URLs

- **Domain**: letitrip.in
- **Production**: https://letitrip.in
- **API**: https://letitrip.in/api
- **Support**: support@letitrip.in

## 🔑 Firebase Project

- **Project ID**: letitrip-in-app
- **Region**: Asia Southeast 1
- **Console**: https://console.firebase.google.com/project/letitrip-in-app

## 🎨 Branding

- **Site Name**: Letitrip
- **Coupon Prefix**: LT (e.g., LT12AB34)
- **Business**: Letitrip Private Limited

## 📦 Repository

- **GitHub**: https://github.com/mohasinac/letitrip.in
- **Branch**: AI-Workflow-Test-scenario
- **Owner**: mohasinac

## 🔧 Configuration Files

### Environment Variables

```bash
# Development
.env.local (gitignored)

# Production
Set in Vercel Dashboard

# Template
.env.local.example (public)
```

### Site Constants

```typescript
// src/constants/site.ts
SITE_NAME = "Letitrip";
SITE_DOMAIN = "letitrip.in";
SITE_URL = "https://letitrip.in";
CONTACT_EMAIL = "support@letitrip.in";
```

## ⚙️ Quick Commands

### Development

```powershell
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
```

### Deployment

```powershell
# Firebase Rules (NOT hosting)
npm run setup:firebase-rules

# Vercel Setup Helper
npm run setup:vercel

# Deploy (via Vercel Dashboard or CLI)
vercel --prod
```

### Testing

```powershell
npm run test:api     # Test API endpoints
npm run test:auth    # Test authentication
npm run test:auction # Test auction system
```

## 🎯 Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Firebase rules deployed
- [ ] Domain letitrip.in configured in Vercel
- [ ] SSL certificate verified
- [ ] Test production deployment
- [ ] Verify Firebase integration

## 📚 Documentation

- **Setup Guide**: `SETUP-GUIDE.md`
- **Config Summary**: `CONFIG-UPDATE-SUMMARY.md`
- **Migration Checklist**: `MIGRATION-CHECKLIST.md`
- **Main README**: `README.md`

## 🔐 Security Notes

### Gitignored (Safe)

- `.env.local`
- `.env.production`
- `*firebase*adminsdk*.json`
- `.firebase/`
- `logs/`

### Public (Committed)

- `.env.local.example`
- `firebase.json`
- `firestore.rules`
- `storage.rules`

## 🎉 Status

✅ **Configuration Complete**

- Domain configured
- Branding updated
- Constants centralized
- Ready for deployment

## 📞 Support

- **Email**: support@letitrip.in
- **Repo Issues**: https://github.com/mohasinac/letitrip.in/issues

---

**Last Updated**: November 10, 2025
**Version**: 1.0.0
