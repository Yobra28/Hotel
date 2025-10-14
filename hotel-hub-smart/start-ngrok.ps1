Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Smart Hotel - ngrok Hosting Setup" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
Write-Host "Please wait for the server to start..." -ForegroundColor Yellow
Write-Host ""

# Start the development server in background
$devServer = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden

# Wait for server to start
Start-Sleep -Seconds 8

Write-Host "✅ Server should be running on http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Yellow
Write-Host "This will create a public URL for your hotel system" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT NOTES:" -ForegroundColor Red
Write-Host "• Your hotel system will be publicly accessible" -ForegroundColor Red
Write-Host "• Share the ngrok URL only with trusted users" -ForegroundColor Red  
Write-Host "• Demo login credentials:" -ForegroundColor Yellow
Write-Host "  Admin: admin@hotel.com / admin123" -ForegroundColor White
Write-Host "  Receptionist: receptionist@hotel.com / receptionist123" -ForegroundColor White
Write-Host "  Guest: guest@hotel.com / guest123" -ForegroundColor White
Write-Host ""

# Start ngrok
try {
    Write-Host "🔗 Starting ngrok tunnel..." -ForegroundColor Green
    & ngrok http 8080 --log=stdout
}
catch {
    Write-Host "❌ Error starting ngrok: $_" -ForegroundColor Red
    Write-Host "Make sure ngrok is installed and authenticated" -ForegroundColor Yellow
}

# Cleanup
if ($devServer -and !$devServer.HasExited) {
    Write-Host "Stopping development server..." -ForegroundColor Yellow
    Stop-Process -Id $devServer.Id -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")