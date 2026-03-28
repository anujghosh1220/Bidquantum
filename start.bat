@echo off
echo Starting BidQuantum...
echo.
echo [1/3] Starting Backend Server...
cd backend
start /B cmd /c "npm start && pause"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Server...
cd ..
start /B cmd /c "npm start && pause"
timeout /t 5 /nobreak >nul

echo [3/3] Opening Application...
start http://localhost:3000

echo.
echo ========================================
echo   BidQuantum is starting up...
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /F /IM node.exe >nul 2>&1
echo Done!
pause
