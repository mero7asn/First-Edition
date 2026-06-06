# Deploy via GitHub → Vercel (Recommended Method)

## 🎯 Step 1: Push to GitHub

### Option A: Using GitHub Desktop (Easiest)
1. Download GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository
4. Select: `c:\Users\Admin\Downloads\First Edition`
5. Click "Publish repository"
6. Uncheck "Keep this code private" (or keep it private, your choice)
7. Click "Publish Repository"

### Option B: Using Git Command Line
Open Command Prompt in your project folder:

```bash
cd "c:\Users\Admin\Downloads\First Edition"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - First Edition e-commerce"

# Create a new repository on GitHub.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/first-edition.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🚀 Step 2: Deploy Backend to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your **first-edition** repository
5. Vercel will detect multiple folders. Choose **backend** folder:
   - Click **"Configure"**
   - Set **Root Directory**: `backend`
   - Leave **Framework Preset**: Other
   - Click **"Continue"**

6. **Configure Project:**
   - Project Name: `first-edition-backend` (or any name)
   - Click **"Environment Variables"**
   - Add these variables (from your backend/.env file):

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

   (You'll update FRONTEND_URL after deploying frontend)

7. Click **"Deploy"**

8. Wait for deployment to complete. You'll get a URL like:
   ```
   https://first-edition-backend.vercel.app
   ```

---

## 🎨 Step 3: Deploy Frontend to Vercel

1. Go back to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select the same **first-edition** repository
4. This time, choose **frontend** folder:
   - Click **"Configure"**
   - Set **Root Directory**: `frontend`
   - **Framework Preset**: Create React App (auto-detected)
   - Click **"Continue"**

5. **Configure Project:**
   - Project Name: `first-edition-frontend` (or any name)
   - Click **"Environment Variables"**
   - Add these:

   ```
   REACT_APP_API_URL=https://first-edition-backend.vercel.app/api
   REACT_APP_WHATSAPP_NUMBER=+1234567890
   REACT_APP_INTEGRITY_SECRET=your_integrity_secret_change_in_production
   ```

   (Replace the backend URL with YOUR actual backend URL from Step 2)

6. Click **"Deploy"**

7. You'll get a frontend URL like:
   ```
   https://first-edition-frontend.vercel.app
   ```

---

## 🔄 Step 4: Update Backend CORS

1. Go to Vercel Dashboard → **Backend Project**
2. Go to **Settings** → **Environment Variables**
3. Edit **FRONTEND_URL** and update it with your actual frontend URL:
   ```
   FRONTEND_URL=https://first-edition-frontend.vercel.app
   ```
4. Go to **Deployments** tab
5. Click the **"..."** menu on the latest deployment → **"Redeploy"**

---

## ✅ Step 5: Verify Everything Works

1. Open your frontend URL
2. Test registration/login
3. Test browsing products
4. Check if images load (they should use Vercel Blob)

---

## 🎉 You're Done!

Your app is now live with:
- ✅ Frontend on Vercel
- ✅ Backend on Vercel
- ✅ Database on MongoDB Atlas
- ✅ Storage on Vercel Blob
- ✅ Automatic deployments on every git push!

---

## 🔄 Future Updates

Every time you push to GitHub:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy both frontend and backend! 🚀

---

## 📝 Important Notes

### MongoDB Atlas Setup
Make sure your MongoDB Atlas allows connections from anywhere:
1. Go to MongoDB Atlas Dashboard
2. Network Access → IP Access List
3. Add IP: `0.0.0.0/0` (Allow from anywhere)
4. Or add Vercel's IP ranges

### Vercel Blob Storage
Your images will be stored in Vercel Blob. Make sure your upload routes use the `@vercel/blob` package (already configured in your code).

### Custom Domain (Optional)
You can add a custom domain in Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS setup instructions

---

## 🆘 Troubleshooting

**Backend deployment fails:**
- Check environment variables are set correctly
- Check MongoDB URI is correct
- Check Node.js version in package.json engines

**Frontend can't connect to backend:**
- Verify REACT_APP_API_URL in frontend env vars
- Check CORS settings (FRONTEND_URL in backend)
- Open browser console to see errors

**Images not uploading:**
- Check Vercel Blob is properly configured
- Check BLOB_READ_WRITE_TOKEN in backend env vars (if using blob)

**Database connection fails:**
- MongoDB Atlas: Check Network Access allows 0.0.0.0/0
- Check MONGODB_URI format
