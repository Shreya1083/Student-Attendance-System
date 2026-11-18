@echo off
:: Batch script to register MongoDB as a Windows Service using Network Service
echo ========================================================
echo   Register MongoDB Community Server 9.0 Windows Service
echo ========================================================

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Administrator permission required. Elevating...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~dp0install_mongodb_service.bat\"\"' -Verb RunAs"
    exit /b
)

echo Stopping any manual mongod process...
taskkill /F /IM mongod.exe >nul 2>&1

echo Installing MongoDB Windows Service with Network Service account...
"C:\Users\Shreya itagi\mongodb-server\MongoDB\Server\9.0\bin\mongod.exe" --config "C:\Users\Shreya itagi\mongodb-server\MongoDB\Server\9.0\bin\mongod.cfg" --serviceName "MongoDB" --serviceDisplayName "MongoDB Server" --serviceDescription "MongoDB Database Server" --serviceUser "NT AUTHORITY\NetworkService" --install

echo Configuring service to start automatically...
sc.exe config MongoDB start= auto

echo Starting MongoDB service...
net start MongoDB

echo.
echo ========================================================
echo   MongoDB Service is configured and running!
echo ========================================================
pause
