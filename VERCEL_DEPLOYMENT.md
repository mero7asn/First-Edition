# Deploy to Vercel (Free - No Credit Card Needed)

## ✅ What You Have
- Vercel account with Blob storage
- MongoDB Atlas (free tier)
- Backend configured for Vercel
- Frontend ready to deploy

## 🚀 Step 1: Deploy Backend to Vercel

1. **Open terminal in the backend folder:**
```bash
cd "c:\Users\Admin\Downloads\First Edition\backend"
```

2. **Login to Vercel (if not already):**
```bash
vercel login
```

3. **Deploy the backend:**
```bash
vercel --prod
```

4. **During deployment, answer the prompts:**
   - Set up and deploy? **Y**
   - Which scope? **Select your account**
   - Link to existing project? **N**
   - Project name? **first-edition-backend** (or any name)
   - Directory? **Just press Enter** (current directory)
   - Override settings? **N**

5. **After deployment, you'll get a URL like:**
   ```
   https://first-edition-backend.vercel.app
   ```

6. **Add Environment Variables in Vercel Dashboard:**
   - Go to: https://vercel.com/dashboard
   - Select your backend project
   - Go to Settings → Environment Variables
   - Add these variables:

   ```
   MONGODB_URI=your_mongodb_atlas_uri_here
   JWT_SECRET=6c02691c3fdbe108578de46ea43ab6ec7d01bbdfbff0979f09f66fe82bc0c3c80a8340f46c459c30a7e9ea5b2215a6d65ed01cfeea25e61efc3b805440be1d81
   JWT_EXPIRE=7d
   NODE_ENV=production
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password
   STRIPE_SECRET_KEY=your_stripe_secret_key
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

7. **Redeploy after adding environment variables:**
```bash
vercel --prod
```

## 🎨 Step 2: Deploy Frontend to Vercel

1. **Update frontend production environment file:**
   - Open `frontend/.env.production`
   - Replace the URL with your backend URL:
   ```
   REACT_APP_API_URL=https://first-edition-backend.vercel.app/api
   ```

2. **Open terminal in the frontend folder:**
```bash
cd "c:\Users\Admin\Downloads\First Edition\frontend"
```

3. **Deploy the frontend:**
```bash
vercel --prod
```

4. **Answer the prompts:**
   - Set up and deploy? **Y**
   - Which scope? **Select your account**
   - Link to existing project? **N**
   - Project name? **first-edition-frontend** (or any name)
   - Directory? **Just press Enter**
   - Override settings? **N**

5. **You'll get a frontend URL like:**
   ```
   https://first-edition-frontend.vercel.app
   ```

## 🔄 Step 3: Update CORS Settings

1. **Go back to Vercel Dashboard → Backend Project**
2. **Update the `FRONTEND_URL` environment variable:**
   ```
   FRONTEND_URL=https://first-edition-frontend.vercel.app
   ```

3. **Redeploy backend:**
```bash
cd "c:\Users\Admin\Downloads\First Edition\backend"
vercel --prod
```

## ✅ Done!

Your app is now live:
- Frontend: https://first-edition-frontend.vercel.app
- Backend: https://first-edition-backend.vercel.app
- Database: MongoDB Atlas
- Storage: Vercel Blob

## 🔧 Future Updates

To update your app:

**Backend:**
```bash
cd backend
vercel --prod
```

**Frontend:**
```bash
cd frontend
vercel --prod
```

## 📝 Notes

- All services are FREE
- No credit card required
- Vercel gives you automatic HTTPS
- Vercel provides CI/CD from GitHub (optional)
- Your uploads are stored in Vercel Blob

## 🆘 Troubleshooting

**If backend deployment fails:**
- Make sure all environment variables are set in Vercel Dashboard
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

**If frontend can't connect to backend:**
- Verify REACT_APP_API_URL in `.env.production`
- Check FRONTEND_URL in backend environment variables
- Check browser console for CORS errors

**Database connection issues:**
- MongoDB Atlas: Go to Network Access → Add IP Address → Allow from Anywhere
