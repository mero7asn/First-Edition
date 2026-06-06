@echo off
echo ========================================
echo Pushing to GitHub Repository
echo https://github.com/mero7asn/First-Edition
echo ========================================
echo.

cd "c:\Users\Admin\Downloads\First Edition"

echo Step 1: Initializing Git...
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

echo Step 5: Adding remote repository...
git remote add origin https://github.com/mero7asn/First-Edition.git
echo.

echo Step 6: Pushing to GitHub...
git push -u origin main
echo.

echo ========================================
echo Push Complete!
echo ========================================
echo.
echo Your code is now on GitHub!
echo Visit: https://github.com/mero7asn/First-Edition
echo.
echo Next: Go to https://vercel.com/dashboard to deploy
echo.
pause
