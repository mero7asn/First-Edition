# Deployment Guide - First Edition E-commerce

## Overview
- **Frontend**: Vercel (free, never expires)
- **Backend**: Railway.app (free 500 hours/month, never expires)
- **Database**: MongoDB Atlas (free 512MB, never expires)

---

## Part 1: MongoDB Atlas Setup (Database)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose **FREE** tier (M0 Sandbox)
4. Select a cloud provider region close to you
5. Click "Create Cluster"

### Step 2: Get Connection String
1. In Atlas dashboard, click **"Connect"**
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your actual credentials
5. Add database name at the end: `/first-edition`
   
   Final format:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/first-edition?retryWrites=true&w=majority
   ```

### Step 3: Whitelist All IPs (for Railway to connect)
1. In Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Confirm

---

## Part 2: Backend Deployment (Railway)

### Step 1: Create Railway Account
1. Go to https://railway.app/
2. Click **"Start a New Project"**
3. Sign in with GitHub

### Step 2: Deploy Backend
1. Click **"Deploy from GitHub repo"**
2. Connect your GitHub account
3. Push your `backend/` folder to a GitHub repo first:
   ```bash
   cd "c:\Users\Admin\Downloads\First Edition\backend"
   git init
   git add .
   git commit -m "Initial backend"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fe-backend.git
   git push -u origin main
   ```
4. Select the repo in Railway
5. Railway will auto-detect Node.js and deploy

### Step 3: Add Environment Variables in Railway
1. In Railway project, go to **Variables** tab
2. Add these variables:

```
PORT=5000
MONGODB_URI=mongodb+srv://your-user:your-pass@cluster0.xxxxx.mongodb.net/first-edition?retryWrites=true&w=majority
JWT_SECRET=generate_a_random_32_char_string_here
JWT_EXPIRE=7d
NODE_ENV=production
INTEGRITY_SECRET=generate_another_random_32_char_string
ADMIN_WHATSAPP=+1234567890
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
FRONTEND_URL=https://your-vercel-url.vercel.app
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Get Backend URL
1. After deployment, Railway gives you a URL like:
   ```
   https://fe-backend-production-xxxx.up.railway.app
   ```
2. Copy this — you'll need it for frontend

---

## Part 3: Frontend Deployment (Vercel)

### Step 1: Update Frontend Environment Variables
1. Edit `frontend/.env.production`:
   ```
   REACT_APP_API_URL=https://YOUR-RAILWAY-URL.up.railway.app/api
   REACT_APP_WHATSAPP_NUMBER=+1234567890
   REACT_APP_INTEGRITY_SECRET=same_as_backend_integrity_secret
   ```

### Step 2: Push Frontend to GitHub
```bash
cd "c:\Users\Admin\Downloads\First Edition\frontend"
git init
git add .
git commit -m "Initial frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fe-frontend.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your `fe-frontend` repo
5. Vercel auto-detects React

### Step 4: Add Environment Variables in Vercel
1. In project settings → **Environment Variables**
2. Add:
   ```
   REACT_APP_API_URL = https://YOUR-RAILWAY-URL.up.railway.app/api
   REACT_APP_WHATSAPP_NUMBER = +1234567890
   REACT_APP_INTEGRITY_SECRET = your_secret_here
   ```
3. Click **Deploy**

### Step 5: Update Backend CORS
1. Go back to Railway
2. Update `FRONTEND_URL` variable to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will auto-redeploy

---

## Part 4: Testing Deployment

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Try registering a user
3. Check Network tab — API calls should go to Railway backend
4. Check Railway logs for any errors

---

## Part 5: Create Admin User

Since you can't manually edit MongoDB from Railway, use MongoDB Atlas:

1. In Atlas dashboard, click **"Browse Collections"**
2. Find `first-edition` database → `users` collection
3. Find your registered user
4. Click **Edit**
5. Change `"role": "customer"` to `"role": "admin"`
6. Save
7. Refresh your app and login — you'll have admin access

---

## Cost Breakdown (All FREE Forever)

| Service | Free Tier | Expiration |
|---------|-----------|------------|
| MongoDB Atlas | 512MB storage | Never |
| Railway | 500 hours/month (~20 days uptime) | Never (with GitHub account) |
| Vercel | Unlimited bandwidth | Never |

**Note:** Railway gives 500 free hours/month. If your backend runs 24/7, that's ~20 days. To extend:
- Use Railway's sleep feature (backend sleeps after 5 min idle)
- Or upgrade to Hobby plan ($5/month for unlimited)

---

## Alternative Free Options

If Railway runs out of hours:

### Backend Alternatives:
1. **Render.com** - Free tier, spins down after 15 min idle
2. **Fly.io** - Free 3 VMs, more generous than Railway
3. **Cyclic.sh** - Unlimited free tier for Node.js

### Database Alternatives (if Atlas fills up):
1. **Railway PostgreSQL** - 100MB free (would need to change from MongoDB)
2. **Supabase** - 500MB PostgreSQL free tier

---

## Maintenance

- **Backend logs**: Check Railway dashboard
- **Frontend logs**: Check Vercel deployment logs
- **Database**: Monitor in MongoDB Atlas dashboard
- **Redeploy**: Just push to GitHub — both Vercel and Railway auto-deploy

---

## Security Checklist Before Going Live

✅ Changed all default secrets in .env  
✅ CORS restricted to Vercel frontend URL only  
✅ MongoDB Atlas whitelists only necessary IPs  
✅ Admin account created and tested  
✅ All sensitive data removed from frontend code  
✅ HTTPS enforced (automatic on Vercel/Railway)  

---

## Need Help?

- Railway Docs: https://docs.railway.app/
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
