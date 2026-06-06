@echo off
echo ========================================
echo Setup GitHub Repository
echo ========================================
echo.

cd "c:\Users\Admin\Downloads\First Edition"

echo Step 1: Initialize Git Repository...
git init
echo.

echo Step 2: Adding all files...
git add .
echo.

echo Step 3: Creating initial commit...
git commit -m "Initial commit - First Edition e-commerce platform"
echo.

echo Step 4: Setting main branch...
git branch -M main
echo.

echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Go to https://github.com/new
echo 2. Create a new repository named "first-edition"
echo 3. DON'T add README, .gitignore, or license
echo 4. Copy the repository URL (https://github.com/YOUR_USERNAME/first-edition.git)
echo.
set /p repo_url="Paste your repository URL here: "
echo.

echo Step 5: Adding remote repository...
git remote add origin %repo_url%
echo.

echo Step 6: Pushing to GitHub...
git push -u origin main
echo.

echo ========================================
echo GitHub Setup Complete!
echo ========================================
echo.
echo Now go to https://vercel.com/dashboard to deploy
echo Follow the guide in GITHUB_VERCEL_DEPLOYMENT.md
echo.
pause
