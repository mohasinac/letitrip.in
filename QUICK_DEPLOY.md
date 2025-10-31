# ⚡ Quick Deploy Guide

Fast-track deployment checklist for HobbiesSpot.

## 🚀 5-Minute Deploy to Vercel

### Prerequisites

- [ ] Git repository pushed to GitHub/GitLab/Bitbucket
- [ ] Firebase project configured
- [ ] Domain registered (hobbiesspot.com)

### Steps

#### 1. Install Vercel CLI (1 min)

```powershell
npm install -g vercel
vercel login
```

#### 2. Deploy (2 min)

```powershell
# From project root
vercel

# Follow prompts:
# - Set up new project: Yes
# - Project name: hobbiesspot
# - Directory: ./
# - Deploy: Yes
```

#### 3. Add Environment Variables (2 min)

```powershell
# Required variables
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://hobbiesspot.com

vercel env add JWT_SECRET production
# Enter: (generate with: openssl rand -base64 32)

vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
# Enter: Your Firebase private key

vercel env add RAZORPAY_KEY_ID production
# Enter: Your Razorpay key

vercel env add RAZORPAY_KEY_SECRET production
# Enter: Your Razorpay secret
```

**Or use dashboard**: https://vercel.com/dashboard → Project → Settings → Environment Variables

#### 4. Deploy to Production

```powershell
vercel --prod
```

#### 5. Configure Domain

1. Go to Project Settings → Domains
2. Add `hobbiesspot.com`
3. Update DNS at your registrar:
   - A record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`

Done! Your app is live at https://hobbiesspot.com 🎉

---

## 🔌 Socket.io Server (Render.com)

### 1. Create Web Service (3 min)

1. Go to https://render.com/dashboard
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Name**: `hobbiesspot-socket`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free or Starter ($7/month)

### 2. Add Environment Variables

```
NODE_ENV=production
ALLOWED_ORIGINS=https://hobbiesspot.com,https://www.hobbiesspot.com
```

### 3. Update Vercel

```powershell
vercel env add NEXT_PUBLIC_SOCKET_URL production
# Enter: https://hobbiesspot-socket.onrender.com

vercel --prod
```

---

## 🔥 Firebase Setup (Optional)

If you want to deploy to Firebase Hosting as well:

```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Build and deploy
npm run firebase:deploy-hosting
```

---

## ✅ Quick Verification

After deployment, test these URLs:

- [ ] https://hobbiesspot.com → Homepage loads
- [ ] https://hobbiesspot.com/sitemap.xml → Sitemap loads
- [ ] https://hobbiesspot.com/api/health → Returns 200 OK
- [ ] https://hobbiesspot-socket.onrender.com/health → Socket server OK

---

## 🐛 Common Issues

**Build fails**: Check `vercel logs`
**Environment variables not working**: Redeploy with `vercel --prod --force`
**Domain not working**: Wait 24-48 hours for DNS propagation
**Socket disconnects**: Upgrade Render to Starter plan ($7/month)

---

## 📚 Full Documentation

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Need help?** Check logs:

- Vercel: `vercel logs --follow`
- Render: Dashboard → Logs tab
- Firebase: `firebase --debug`
