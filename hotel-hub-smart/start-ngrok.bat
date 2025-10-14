@echo off
echo ========================================
echo    Smart Hotel - ngrok Hosting Setup
echo ========================================
echo.
echo Starting development server...
echo Please wait for the server to start...
echo.

REM Start the development server in the background
start /B npm run dev

REM Wait for the server to start
timeout /t 5 /nobreak > nul

echo Server should be running on http://localhost:8080
echo.
echo Starting ngrok tunnel...
echo This will create a public URL for your hotel system
echo.

REM Start ngrok
ngrok http 8080 --log=stdout

pause