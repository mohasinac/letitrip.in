# Deployment Guide - Complete Reference

**Target Environment**: Vercel (Frontend) + Render (Backend)  
**Status**: ✅ Production Ready

---

## Quick Deploy Commands

### Frontend (Vercel)

```bash
# Auto-deploy on git push to main
git add .
git commit -m "Deploy update"
git push origin main

# Manual deploy
npm run build
vercel --prod
```

### Backend (Render)

```bash
# Deploy via Render Dashboard
# Or via CLI:
render deploy --service beyblade-socket-server
```

---

## Environment Setup

### Frontend (.env.local)

```bash
# Socket.IO Server URL
NEXT_PUBLIC_SOCKET_URL=https://beyblade-server.onrender.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Backend (.env on Render)

```bash
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://justforview.in,https://www.justforview.in
```

---

## Vercel Configuration

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SOCKET_URL": "https://beyblade-server.onrender.com"
  }
}
```

### Automatic Deployments

- ✅ Push to `main` branch → Production
- ✅ Pull requests → Preview deployments
- ✅ Build logs available in dashboard

---

## Render Configuration

### render.yaml

```yaml
services:
  - type: web
    name: beyblade-socket-server
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: PORT
        value: 3001
      - key: NODE_ENV
        value: production
```

### Health Check

- **Endpoint**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds

---

## DNS & Domain Setup

### Domain Configuration

1. Point domain to Vercel
2. Add DNS records:
   ```
   A     @    76.76.21.21
   CNAME www  cname.vercel-dns.com
   ```
3. Enable HTTPS (automatic via Vercel)

### SSL Certificates

- ✅ Auto-provisioned by Vercel
- ✅ Auto-renewed
- ✅ Force HTTPS redirect enabled

---

## Monitoring

### Key Metrics to Track

- **Frontend**: Vercel Analytics
- **Backend**: Render metrics
- **Socket.IO**: Connection count, latency
- **Errors**: Error tracking (optional: Sentry)

### Health Checks

```bash
# Frontend
curl https://justforview.in/api/health

# Backend
curl https://beyblade-server.onrender.com/health
```

---

## Scaling

### Current Limits

- **Vercel**: Unlimited bandwidth, 100GB/month
- **Render**: Free tier or paid plan
- **Socket.IO**: Max 10 rooms (20 players)

### Upgrading

1. **Render**: Upgrade to Standard ($7/month)
2. **Increase room limit**: Edit `MAX_ROOMS` in server.js
3. **Add Redis**: For persistent room state

---

## Rollback Procedure

### Frontend (Vercel)

1. Go to Vercel Dashboard
2. Select deployment
3. Click "Promote to Production"

### Backend (Render)

1. Redeploy previous commit via dashboard
2. Or: `git revert` + redeploy

---

## Common Issues

### Build Failures

- Check Node version (20.x required)
- Clear cache: `vercel --prod --force`
- Verify dependencies: `npm install`

### Socket Connection Issues

- Verify `NEXT_PUBLIC_SOCKET_URL`
- Check CORS settings on server
- Enable WebSocket support on Render

### Performance Issues

- Enable caching headers
- Optimize images
- Use CDN for assets

---

## Post-Deployment Checklist

- [ ] Verify frontend loads at production URL
- [ ] Test single-player mode
- [ ] Test multiplayer mode (2 browser windows)
- [ ] Check mobile responsiveness
- [ ] Verify analytics tracking
- [ ] Monitor error rates
- [ ] Check server resource usage

---

## Maintenance

### Regular Tasks

- **Weekly**: Review error logs
- **Monthly**: Update dependencies
- **Quarterly**: Security audit

### Updates

```bash
# Update dependencies
npm update
npm audit fix

# Test locally
npm run dev

# Deploy
git push origin main
```

---

**Last Updated**: October 30, 2025  
**Contact**: [Your Team]
