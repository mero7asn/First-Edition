@echo off
echo ========================================
echo First Edition - Vercel Deployment
echo ========================================
echo.

echo Step 1: Deploying Backend...
echo.
cd backend
call vercel --prod
echo.
echo Backend deployed! Copy the URL above.
echo.

pause

echo.
echo Step 2: Update frontend .env.production file with your backend URL
echo Press any key when ready to deploy frontend...
pause

cd ..\frontend
echo.
echo Deploying Frontend...
call vercel --prod
echo.
echo Frontend deployed!
echo.

pause

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Go to vercel.com/dashboard
echo 2. Select backend project
echo 3. Add environment variables (see VERCEL_DEPLOYMENT.md)
echo 4. Update FRONTEND_URL in backend env vars
echo 5. Redeploy backend with: vercel --prod
echo.
pause
