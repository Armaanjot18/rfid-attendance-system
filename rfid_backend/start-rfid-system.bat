@echo off
echo =========================================
echo    Starting RFID Attendance System
echo =========================================
echo.

cd /d "%~dp0"

echo Starting Backend Server...
start "Backend Server" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo Starting Serial Bridge...
start "Serial Bridge" cmd /k "node serial-bridge.js"
timeout /t 2 /nobreak >nul

echo.
echo =========================================
echo Both servers are running!
echo =========================================
echo.
echo Backend Server: http://localhost:3000
echo Serial Bridge: Reading from Arduino USB
echo.
echo Close those windows to stop the system.
echo.
pause
