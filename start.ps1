Write-Host "Starting BidQuantum..." -ForegroundColor Green
Write-Host ""

Write-Host "[1/3] Starting Backend Server..." -ForegroundColor Yellow
Set-Location backend
Start-Process cmd -ArgumentList "/c", "npm start & pause" -WindowStyle Hidden
Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Frontend Server..." -ForegroundColor Yellow
Set-Location ..
Start-Process cmd -ArgumentList "/c", "npm start & pause" -WindowStyle Hidden
Start-Sleep -Seconds 5

Write-Host "[3/3] Opening Application..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BidQuantum is starting up..." -ForegroundColor White
Write-Host "   Backend: http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to stop all servers..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Stopping servers..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to exit"
