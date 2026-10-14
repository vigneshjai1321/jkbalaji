<#
  JK Balaji deploy: E:\JKbalaji -> VPS /root/jkbalaji
  Usage:
    cd E:\JKbalaji\deployment
    .\deploy.ps1                          # default BUILD_TARGETS=admin,api
    .\deploy.ps1 -BuildTargets "all"
    .\deploy.ps1 -BuildTargets "admin,api" -SkipBuildLocal
#>
param(
  [string]$HostAddr = "46.202.160.193",
  [string]$User = "root",
  [int]$Port = 22,
  [string]$KeyPath = "C:\Users\vigne\.ssh\id_ed25519",
  [string]$LocalRoot = "E:\JKbalaji",
  [string]$RemoteRoot = "/root/jkbalaji",
  [string]$BuildTargets = "admin,api",
  [switch]$SkipBuildLocal,
  [switch]$SkipSsl,
  [switch]$SkipDbMigrate
)

$ErrorActionPreference = "Stop"
$Report = Join-Path $PSScriptRoot "DEPLOYMENT_REPORT.md"
$ArtifactDir = Join-Path $PSScriptRoot "artifacts"
$Tarball = Join-Path $ArtifactDir "jkbalaji-src.tgz"
$deployFailed = $false
$failureReason = ""
$localBuildResult = "skipped"
$remoteInstallOutput = ""
$verifyOutput = ""

function Invoke-Ssh([string]$Cmd) {
  $sshArgs = @("-p", "$Port")
  if (Test-Path $KeyPath) { $sshArgs = @("-i", $KeyPath) + $sshArgs }
  $sshArgs += "${User}@${HostAddr}", $Cmd
  & ssh @sshArgs
  return $LASTEXITCODE
}

function Invoke-Scp([string]$Local, [string]$Remote) {
  $scpArgs = @()
  if (Test-Path $KeyPath) { $scpArgs += @("-i", $KeyPath) }
  $scpArgs += @("-P", "$Port", $Local, "${User}@${HostAddr}:${Remote}")
  & scp @scpArgs
  if ($LASTEXITCODE -ne 0) { throw "SCP failed ($Local -> $Remote)" }
}

function Get-LocalBuildCommands([string]$targets) {
  $t = ($targets -replace '\s', '').ToLower()
  if ($t -eq "all") { return @("npm run build") }
  if ($t -eq "admin,api" -or $t -eq "api,admin") { return @("npm run build:erp") }
  if ($t -in @("re,jew", "jew,re")) { return @("npm run build:public") }

  $parts = @()
  foreach ($raw in ($t -split ',')) {
    switch ($raw) {
      "types" { $parts += "npm run build:types" }
      "api" { $parts += "npm run build:api" }
      "admin" { $parts += "npm run build:admin" }
      "re" { $parts += "npm run build:re" }
      "realestate" { $parts += "npm run build:re" }
      "real-estate" { $parts += "npm run build:re" }
      "jew" { $parts += "npm run build:jew" }
      "jewellery" { $parts += "npm run build:jew" }
      default { if ($raw) { throw "Unknown BuildTargets entry: $raw" } }
    }
  }
  $needTypes = $false
  foreach ($raw in ($t -split ',')) {
    if ($raw -in @("api", "admin", "re", "realestate", "real-estate", "jew", "jewellery")) { $needTypes = $true }
  }
  if ($needTypes -and ($parts -notcontains "npm run build:types")) {
    $parts = @("npm run build:types") + $parts
  }
  if ($parts.Count -eq 0) { throw "BuildTargets resolved to nothing" }
  return $parts
}

function Invoke-LocalBuild([string]$targets) {
  $cmds = Get-LocalBuildCommands $targets
  foreach ($c in $cmds) {
    Write-Host "   -> $c"
    if ($c -notmatch '^npm run (.+)$') { throw "Invalid build command: $c" }
    & npm run $Matches[1]
    if ($LASTEXITCODE -ne 0) { throw "Local build failed on: $c (exit $LASTEXITCODE)" }
  }
  return ($cmds -join "; ")
}

function Write-DeployReport(
  [string]$started,
  [string]$ended,
  [bool]$success
) {
  $status = if ($success) { "SUCCESS" } else { "FAILED" }
  @"
# Deployment Report

- Status: **$status**
- Started: $started
- Finished: $ended
- Target: ${User}@${HostAddr}:$RemoteRoot
- BUILD_TARGETS: $BuildTargets
- Local build: $localBuildResult

## Failure
$(if (-not $success) { $failureReason } else { "(none)" })

## Remote install (tail)
``````
$remoteInstallOutput
``````

## Verification
``````
$verifyOutput
``````

## Live URLs (when deploy succeeds)
- https://jkbalaji.in
- https://cheyyarbalaji.com
- https://admin.jkbalaji.in/
- https://api.jkbalaji.in/api/v1/health

Credentials on server: $RemoteRoot/PROJECT_CREDENTIALS.txt (not committed to git)
"@ | Set-Content -Path $Report -Encoding UTF8
}

$started = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
Write-Host "=== JK Balaji deploy started $started ==="
Write-Host "BUILD_TARGETS=$BuildTargets"

try {
  Write-Host "1) Local build verification"
  if (-not $SkipBuildLocal) {
    Push-Location $LocalRoot
    $localBuildResult = "passed (" + (Invoke-LocalBuild $BuildTargets) + ")"
    Pop-Location
  }

  Write-Host "2) Remote pre-deploy backup"
  $code = Invoke-Ssh "mkdir -p $RemoteRoot/backups && tar -czf $RemoteRoot/backups/pre_deploy_`$(date +%Y%m%d_%H%M%S).tgz --exclude=backups --exclude=node_modules --exclude=.next --exclude=dist -C $RemoteRoot . 2>/dev/null || true"
  if ($code -ne 0) { throw "SSH pre-deploy backup failed (exit $code)" }

  Write-Host "3) Package source"
  New-Item -ItemType Directory -Force -Path $ArtifactDir | Out-Null
  if (Test-Path $Tarball) { Remove-Item $Tarball -Force }
  Push-Location $LocalRoot
  tar -czf $Tarball `
    --exclude=node_modules `
    --exclude=.next `
    --exclude=dist `
    --exclude=Oldfile `
    --exclude=deployment/artifacts `
    --exclude=backups `
    --exclude=test-app `
    --exclude=.git `
    --exclude=PROJECT_CREDENTIALS.txt `
    .
  if ($LASTEXITCODE -ne 0) { throw "Local tarball creation failed" }
  Pop-Location

  Write-Host "4) Upload tarball"
  Invoke-Scp $Tarball "$RemoteRoot/jkbalaji-src.tgz"

  Write-Host "5) Extract and install on VPS"
  $remote = @"
set -euo pipefail
cd $RemoteRoot
mkdir -p apps logs backups
tar -xzf jkbalaji-src.tgz -C $RemoteRoot
chmod +x deployment/scripts/vps-install.sh deployment/scripts/verify-deploy.sh deployment/scripts/prune-stale-paths.sh 2>/dev/null || true
export BUILD_TARGETS='$BuildTargets'
export SKIP_DB_SEED=1
$(if ($SkipDbMigrate) { 'export SKIP_DB_MIGRATE=1' })
bash deployment/scripts/vps-install.sh
"@
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $remoteInstallOutput = & {
    $sshArgs = @("-p", "$Port")
    if (Test-Path $KeyPath) { $sshArgs = @("-i", $KeyPath) + $sshArgs }
    $sshArgs += "${User}@${HostAddr}", $remote
    & ssh @sshArgs 2>&1 | Out-String
  }
  $installExit = $LASTEXITCODE
  $ErrorActionPreference = $prevEap
  if ($installExit -ne 0) {
    throw "Remote vps-install.sh failed (exit $installExit). See DEPLOYMENT_REPORT.md"
  }

  if (-not $SkipSsl) {
    Write-Host "6) SSL + nginx"
    $ssl = @"
if command -v certbot >/dev/null 2>&1; then
  certbot certonly --nginx --cert-name jkbalaji.in-0001 \
    -d jkbalaji.in -d www.jkbalaji.in -d admin.jkbalaji.in -d api.jkbalaji.in \
    -d cheyyarbalaji.com -d www.cheyyarbalaji.com \
    --expand --non-interactive --agree-tos -m admin@jkbalaji.in || true
fi
if [ -f $RemoteRoot/deployment/nginx/jkbalaji-ssl-live.conf ]; then
  cp $RemoteRoot/deployment/nginx/jkbalaji-ssl-live.conf /etc/nginx/sites-available/jkbalaji.conf
  ln -sf /etc/nginx/sites-available/jkbalaji.conf /etc/nginx/sites-enabled/jkbalaji.conf
  nginx -t && systemctl reload nginx
fi
"@
    $prevEapSsl = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $code = Invoke-Ssh $ssl
    $ErrorActionPreference = $prevEapSsl
    if ($code -ne 0) {
      Write-Host "   SSL/certbot step returned exit $code (cert may not be due for renewal); continuing to verification."
    }
  } else {
    Write-Host "6) SSL + nginx (skipped)"
  }

  Write-Host "7) Post-deploy verification"
  $verifyCmd = "export ROOT='$RemoteRoot' BUILD_TARGETS='$BuildTargets'; bash $RemoteRoot/deployment/scripts/verify-deploy.sh"
  $ErrorActionPreference = 'Continue'
  $verifyOutput = & {
    $sshArgs = @("-p", "$Port")
    if (Test-Path $KeyPath) { $sshArgs = @("-i", $KeyPath) + $sshArgs }
    $sshArgs += "${User}@${HostAddr}", $verifyCmd
    & ssh @sshArgs 2>&1 | Out-String
  }
  $verifyExit = $LASTEXITCODE
  $ErrorActionPreference = $prevEap
  if ($verifyExit -ne 0) {
    throw "verify-deploy.sh failed (exit $LASTEXITCODE)"
  }

  Write-Host "8) Fetch credentials template path (server-only file)"
  Write-Host "   Server credentials: ${RemoteRoot}/PROJECT_CREDENTIALS.txt (not copied into repo)"
}
catch {
  $deployFailed = $true
  $failureReason = $_.Exception.Message
  Write-Host "=== DEPLOY FAILED ===" -ForegroundColor Red
  Write-Host $failureReason
}
finally {
  if ((Get-Location).Path -ne $PSScriptRoot) {
    try { Pop-Location } catch {}
  }
}

$ended = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
Write-DeployReport -started $started -ended $ended -success (-not $deployFailed)

if ($deployFailed) {
  Write-Host "=== See $Report ==="
  exit 1
}

Write-Host "=== Deploy complete. See $Report ==="
exit 0
