# Rebuild and run TaskFlow with Docker (so backend + frontend use latest code)
# Run from project root: .\docker\rebuild-and-run.ps1
# Or from docker folder: .\rebuild-and-run.ps1 (then compose file path is compose\docker-compose.yml)

$ErrorActionPreference = "Stop"
$ProjectRoot = if (Test-Path "backend\main.py") { (Get-Location).Path } else { (Get-Item "..").FullName }
Set-Location $ProjectRoot

$ComposeFile = "docker\compose\docker-compose.yml"
if (-not (Test-Path $ComposeFile)) {
    $ComposeFile = "docker/compose/docker-compose.yml"
}

Write-Host "Project root: $ProjectRoot"
Write-Host "Compose file: $ComposeFile"
Write-Host "Rebuilding backend and frontend (no cache)..."
docker compose -f $ComposeFile build --no-cache backend frontend
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Starting containers..."
docker compose -f $ComposeFile up -d
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done. Backend: http://localhost:8000  Frontend: http://localhost:3000"
Write-Host "To view logs: docker compose -f $ComposeFile logs -f"
