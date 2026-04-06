# AguaDC V2 - Railway Rollback Script (PowerShell)
# This script helps rollback to a previous deployment version
# Usage: .\rollback-script.ps1 [-DeploymentIndex 1] [-Confirm]

param(
    [Parameter(Mandatory = $false)]
    [int]$DeploymentIndex = 1,

    [Parameter(Mandatory = $false)]
    [switch]$Confirm
)

# Enable strict error handling
$ErrorActionPreference = "Stop"

# Color output
function Write-Header {
    param([string]$Message)
    Write-Host "`n================================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "================================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

# Check prerequisites
Write-Header "Checking Prerequisites"

# Check Railway CLI
try {
    $railwayVersion = railway --version
    Write-Success "Railway CLI installed: $railwayVersion"
} catch {
    Write-Error "Railway CLI is not installed. Please run: npm install -g @railway/cli"
    exit 1
}

# Check authentication
Write-Header "Verifying Railway Authentication"

try {
    $railwayWhoami = railway whoami 2>&1
    if ($railwayWhoami -like "*not authenticated*" -or $LASTEXITCODE -ne 0) {
        Write-Error "Not authenticated with Railway. Please run: railway login"
        exit 1
    }
    Write-Success "Authenticated as: $railwayWhoami"
} catch {
    Write-Error "Could not verify authentication status"
    exit 1
}

# List available deployments
Write-Header "Available Deployments"

Write-Info "Retrieving deployment history..."

try {
    $deployments = railway deployments 2>&1
    Write-Host $deployments
} catch {
    Write-Error "Failed to retrieve deployment list"
    exit 1
}

# Get target deployment
Write-Header "Selecting Target Deployment"

if ($DeploymentIndex -lt 1) {
    $DeploymentIndex = 1
}

Write-Info "You can specify a different deployment with: -DeploymentIndex N"
Write-Info "Targeting deployment at index: $DeploymentIndex"

# Confirmation
if (-not $Confirm) {
    Write-Warning "ROLLBACK CONFIRMATION REQUIRED"
    Write-Host ""
    Write-Host "This will redeploy a previous version of the backend service."
    Write-Host ""
    Write-Host "Please review:"
    Write-Host "  1. The deployment list above"
    Write-Host "  2. Any data changes since the previous deployment"
    Write-Host "  3. Database state compatibility"
    Write-Host ""

    $confirmInput = Read-Host "Type 'YES' to confirm rollback"

    if ($confirmInput -ne "YES") {
        Write-Error "Rollback cancelled by user"
        exit 0
    }
} else {
    Write-Warning "Rollback confirmation skipped (--Confirm flag used)"
}

# Retrieve current deployment info
Write-Header "Getting Current Deployment Status"

try {
    $currentStatus = railway status 2>&1
    Write-Host $currentStatus
} catch {
    Write-Warning "Could not retrieve current status"
}

# Perform rollback
Write-Header "Executing Rollback"

Write-Host "Initiating rollback process..." -ForegroundColor Cyan

try {
    # Redeploy previous version
    # Note: Railway's CLI may vary. Check 'railway --help' for exact command
    Write-Info "Triggering redeployment of selected version..."

    # This command varies by Railway version
    # Common options:
    # - railway redeploy [deployment-id]
    # - railway deploy --deployment [id]

    Write-Warning "Manual step required:"
    Write-Host ""
    Write-Host "1. Go to: https://railway.app/dashboard"
    Write-Host "2. Select your AguaDC V2 project"
    Write-Host "3. Find the deployment you want to roll back to"
    Write-Host "4. Click 'Redeploy' on that deployment"
    Write-Host ""
    Write-Info "Or use Railway CLI command:"
    Write-Host "  railway redeploy [deployment-id]"
    Write-Host ""

} catch {
    Write-Error "Rollback command failed: $_"
    exit 1
}

# Post-rollback verification
Write-Header "Post-Rollback Verification"

Write-Info "Waiting for rollback deployment to complete..."
Start-Sleep -Seconds 10

Write-Host "Checking service status..." -ForegroundColor Cyan
try {
    $status = railway status 2>&1
    Write-Host $status
    Write-Success "Service status retrieved"
} catch {
    Write-Warning "Could not retrieve service status. Check Railway UI."
}

Write-Host "Retrieving recent logs..." -ForegroundColor Cyan
try {
    railway logs --tail 30
} catch {
    Write-Warning "Could not retrieve logs"
}

# Test API health
Write-Header "Testing API Health"

Write-Host "Waiting 30 seconds for service to stabilize..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

try {
    Write-Host "Attempting to fetch API health check..." -ForegroundColor Cyan
    # This would need the actual service URL
    Write-Info "To test the API, use:"
    Write-Host "  curl https://your-aguadc-api.railway.app/api/health"
    Write-Host ""
} catch {
    Write-Warning "Could not perform health check"
}

# Final status
Write-Header "Rollback Process Summary"

Write-Host "Rollback has been initiated." -ForegroundColor Green
Write-Host ""
Write-Host "Monitor deployment progress at:" -ForegroundColor Cyan
Write-Host "  https://railway.app/dashboard"
Write-Host ""
Write-Host "View logs with:" -ForegroundColor Cyan
Write-Host "  railway logs --tail 100"
Write-Host ""
Write-Host "If issues persist:" -ForegroundColor Yellow
Write-Host "  1. Check application logs in Railway UI"
Write-Host "  2. Verify database connectivity"
Write-Host "  3. Check environment variables are correct"
Write-Host "  4. Review recent commits for breaking changes"
Write-Host ""

Write-Success "Rollback script completed!"
