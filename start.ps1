Write-Host "=== Sistema Bancario - Supabase Startup ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Starting Supabase TCP proxy (IPv4 -> IPv6)..." -ForegroundColor Yellow
$proxyProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*supabase-proxy*" }
if (-not $proxyProcess) {
  Start-Process powershell -ArgumentList "-NoProfile -WindowStyle Hidden -Command node `"$PSScriptRoot\supabase-proxy.cjs`"" -WindowStyle Hidden
  Start-Sleep -Seconds 2
  $test = Test-NetConnection -ComputerName localhost -Port 5444 -WarningAction SilentlyContinue -InformationAction SilentlyContinue
  if ($test.TcpTestSucceeded) {
    Write-Host "  ✅ Proxy running on port 5444" -ForegroundColor Green
  } else {
    Write-Host "  ❌ Proxy failed to start" -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host "  ✅ Proxy already running" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/3] Starting Docker containers..." -ForegroundColor Yellow
docker compose up -d
if ($?) {
  Write-Host "  ✅ Containers started" -ForegroundColor Green
} else {
  Write-Host "  ❌ Failed to start containers" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "[3/3] Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$services = @(
  @{name="Auth Service"; port=3001},
  @{name="Account Service"; port=3002},
  @{name="Points Service"; port=3003},
  @{name="Frontend"; port=5173}
)

foreach ($svc in $services) {
  try {
    $result = Invoke-RestMethod -Uri "http://localhost:$($svc.port)/api/v1/health" -ErrorAction Stop
    Write-Host "  ✅ $($svc.name) - $($result.status)" -ForegroundColor Green
  } catch {
    try {
      $null = Invoke-WebRequest -Uri "http://localhost:$($svc.port)" -ErrorAction Stop
      Write-Host "  ✅ $($svc.name) - Online" -ForegroundColor Green
    } catch {
      Write-Host "  ⚠️  $($svc.name) - Not responding yet" -ForegroundColor Yellow
    }
  }
}

Write-Host ""
Write-Host "=== Sistema Bancario is running ===" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Auth API: http://localhost:3001/api-docs" -ForegroundColor White
Write-Host "  Account API: http://localhost:3002/api-docs" -ForegroundColor White
Write-Host "  Points API: http://localhost:3003/api-docs" -ForegroundColor White
Write-Host ""
Write-Host "To stop: docker compose down" -ForegroundColor Gray
