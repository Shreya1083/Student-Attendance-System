$logPath = "C:\Users\Shreya itagi\setup_mongodb_service.log"
Start-Transcript -Path $logPath -Force

Write-Host "=== Starting MongoDB Windows Service Setup ==="

$binDir = "C:\Program Files\MongoDB\Server\9.0\bin"
$dataDir = "C:\Program Files\MongoDB\Server\9.0\data"
$logDir = "C:\Program Files\MongoDB\Server\9.0\log"
$cfgPath = "$binDir\mongod.cfg"

# 1. Create directories if missing
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "Created data directory: $dataDir"
}
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    Write-Host "Created log directory: $logDir"
}

# 2. Grant permissions to Network Service, Administrators, and SYSTEM
Write-Host "Setting folder permissions for NT AUTHORITY\NetworkService..."
icacls $dataDir /grant "NT AUTHORITY\NetworkService:(OI)(CI)F" /T /C /Q
icacls $logDir /grant "NT AUTHORITY\NetworkService:(OI)(CI)F" /T /C /Q
icacls $binDir /grant "NT AUTHORITY\NetworkService:(OI)(CI)RX" /T /C /Q

# 3. Write clean mongod.cfg with absolute paths
$configContent = @"
# mongod.cfg for MongoDB Community Server 9.0

systemLog:
  destination: file
  path: C:\Program Files\MongoDB\Server\9.0\log\mongod.log
  logAppend: true

storage:
  dbPath: C:\Program Files\MongoDB\Server\9.0\data

net:
  port: 27017
  bindIp: 127.0.0.1
"@

Set-Content -Path $cfgPath -Value $configContent -Encoding Ascii
Write-Host "Updated mongod.cfg successfully."

# 4. Copy mongosh binaries to bin folder if available in Temp
$mongoshSource = "C:\Users\Shreya itagi\AppData\Local\Temp\mongosh-extracted\mongosh-2.14.2-win32-x64\bin\*"
if (Test-Path "C:\Users\Shreya itagi\AppData\Local\Temp\mongosh-extracted\mongosh-2.14.2-win32-x64\bin\mongosh.exe") {
    Copy-Item -Path $mongoshSource -Destination $binDir -Force
    Write-Host "Copied mongosh and DLLs to $binDir."
}

# 5. Check if MongoDB service already exists
$existingService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "Existing MongoDB service found. Stopping and removing..."
    Stop-Service -Name "MongoDB" -Force -ErrorAction SilentlyContinue
    & "$binDir\mongod.exe" --remove --serviceName "MongoDB"
    Start-Sleep -Seconds 2
}

# 6. Install MongoDB service
Write-Host "Installing MongoDB Windows service..."
# Try mongod --install
$installOutput = & "$binDir\mongod.exe" --config "$cfgPath" --serviceName "MongoDB" --serviceDisplayName "MongoDB Server" --serviceDescription "MongoDB Database Server" --serviceUser "NT AUTHORITY\NetworkService" --install 2>&1
Write-Host "mongod --install result: $installOutput"

Start-Sleep -Seconds 2

# Fallback: if service was not created, use sc.exe
$checkSvc = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if (-not $checkSvc) {
    Write-Host "Using sc.exe fallback to create MongoDB service..."
    $binPath = "`"$binDir\mongod.exe`" --config `"$cfgPath`" --service"
    sc.exe create "MongoDB" binPath= $binPath DisplayName= "MongoDB Server" start= auto obj= "NT AUTHORITY\NetworkService"
    Start-Sleep -Seconds 2
}

# 7. Configure and start service
Set-Service -Name "MongoDB" -StartupType Automatic
Write-Host "Starting MongoDB service..."
Start-Service -Name "MongoDB"
Start-Sleep -Seconds 3

# 8. Add to System and User PATH
$sysPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::Machine)
if ($sysPath -notlike "*$binDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$sysPath;$binDir", [EnvironmentVariableTarget]::Machine)
    Write-Host "Added $binDir to Machine PATH."
}

$userPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
if ($userPath -notlike "*$binDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$binDir", [EnvironmentVariableTarget]::User)
    Write-Host "Added $binDir to User PATH."
}

# 9. Verify Service Status
$finalSvc = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($finalSvc) {
    Write-Host "SUCCESS: MongoDB service is $($finalSvc.Status)"
} else {
    Write-Host "ERROR: MongoDB service not found."
}

Stop-Transcript
Write-Host "=== MongoDB Setup Script Finished ==="
