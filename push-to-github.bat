@echo off
echo ========================================
echo Push First Edition to GitHub
echo ========================================
echo.

cd "c:\Users\Admin\Downloads\First Edition"

echo Checking git status...
git status
echo.

set /p commit_message="Enter commit message: "

echo.
echo Adding files...
git add .

echo.
echo Committing...
git commit -m "%commit_message%"

echo.
echo Pushing to GitHub...
git push

echo.
echo ========================================
echo Done! Check Vercel for auto-deployment
echo ========================================
pause
