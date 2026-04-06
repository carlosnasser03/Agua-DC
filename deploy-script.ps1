# AguaDC V2 - Railway Deployment Script (PowerShell)
# This script automates the deployment process to Railway
# Requirements: Node.js, npm, PowerShell 5.0+
# Usage: .\deploy-script.ps1 -Environment staging|production -SetVariables

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("staging", "production")]
    [string]$Environment,

    [Parameter(Mandatory = $false)]
    [switch]$SetVariables,

    [Parameter(Mandatory = $false)]
    [switch]$SkipTests
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

# Check prerequisites
Write-Header "Checking Prerequisites"

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js installed: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js 20 or higher."
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Success "npm installed: $npmVersion"
} catch {
    Write-Error "npm is not installed."
    exit 1
}

# Check Railway CLI
try {
    $railwayVersion = railway --version
    Write-Success "Railway CLI installed: $railwayVersion"
} catch {
    Write-Warning "Railway CLI not found. Installing now..."
    npm install -g @railway/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install Railway CLI"
        exit 1
    }
    Write-Success "Railway CLI installed successfully"
}

# Check authentication
Write-Header "Verifying Railway Authentication"

try {
    $railwayWhoami = railway whoami 2>&1
    if ($railwayWhoami -like "*not authenticated*" -or $LASTEXITCODE -ne 0) {
        Write-Warning "Not authenticated with Railway. Starting login process..."
        railway login
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to authenticate with Railway"
            exit 1
        }
    } else {
        Write-Success "Authenticated as: $railwayWhoami"
    }
} catch {
    Write-Warning "Could not verify authentication status. You may need to run 'railway login'"
}

# Build and test
if (-not $SkipTests) {
    Write-Header "Building and Testing Backend"

    Push-Location backend

    try {
        Write-Host "Installing dependencies..." -ForegroundColor Cyan
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install dependencies"
            exit 1
        }
        Write-Success "Dependencies installed"

        Write-Host "Running tests..." -ForegroundColor Cyan
        npm test
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Some tests failed. Continue deployment? (Y/n)"
            $response = Read-Host
            if ($response -eq "n") {
                Write-Error "Deployment cancelled by user"
                exit 1
            }
        } else {
            Write-Success "All tests passed"
        }

        Write-Host "Building application..." -ForegroundColor Cyan
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Build failed"
            exit 1
        }
        Write-Success "Build completed successfully"

    } finally {
        Pop-Location
    }
} else {
    Write-Warning "Skipping tests and build (--SkipTests flag used)"
}

# Environment-specific configuration
Write-Header "Configuring Deployment for $([char]::ToUpper($_[0]) + $_.Substring(1))"

$envFile = "backend/.env.$Environment"

if (Test-Path $envFile) {
    Write-Success "Found $envFile configuration file"
} else {
    Write-Warning "$envFile not found. Using defaults."
}

# Set Railway environment variables
if ($SetVariables) {
    Write-Header "Setting Railway Environment Variables"

    $variables = @{
        "NODE_ENV"         = "production"
        "PORT"             = "3000"
        "JWT_EXPIRATION"   = "24h"
    }

    # Add environment-specific variables
    if ($Environment -eq "staging") {
        $variables["ADMIN_PANEL_URL"] = "https://staging-admin.aguadc.hn"
    } else {
        $variables["ADMIN_PANEL_URL"] = "https://admin.aguadc.hn"
    }

    Write-Warning "You need to set these variables manually in Railway UI:"
    Write-Host "  - JWT_SECRET (generate a strong random string)"
    Write-Host "  - DATABASE_URL (from Railway PostgreSQL add-on)"
    Write-Host "  - INITIAL_ADMIN_PASS (secure password)"
    Write-Host ""
    Write-Warning "Or use the Railway CLI:"
    Write-Host "  railway variables set JWT_SECRET='your_secure_secret'"
    Write-Host "  railway variables set DATABASE_URL='postgresql://...'"
    Write-Host ""
}

# Deploy to Railway
Write-Header "Starting Deployment to $Environment"

Write-Host "Connecting to Railway project..." -ForegroundColor Cyan
railway link

if ($LASTEXITCODE -ne 0) {
    Write-Warning "Could not link to existing Railway project. Creating new one..."
    # The user will need to configure this through Railway UI
}

Write-Host "Deploying to Railway..." -ForegroundColor Cyan
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Success "Deployment to Railway initiated successfully"
} else {
    Write-Error "Deployment failed"
    exit 1
}

# Post-deployment checks
Write-Header "Post-Deployment Verification"

Write-Host "Waiting for deployment to complete (you can monitor progress in Railway UI)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "Retrieving deployment logs..." -ForegroundColor Cyan
try {
    railway logs --tail 20
} catch {
    Write-Warning "Could not retrieve logs. Check Railway UI for deployment status."
}

Write-Host "Getting service URL..." -ForegroundColor Cyan
try {
    $serviceUrl = railway open --copy 2>&1
    Write-Success "Service URL: $serviceUrl"
} catch {
    Write-Warning "Could not retrieve service URL. Check Railway UI dashboard."
}

Write-Header "Deployment Completed"

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Monitor the deployment at: https://railway.app/dashboard"
Write-Host "2. Verify the service is running at the provided URL"
Write-Host "3. Test the API documentation at: {service-url}/api/docs"
Write-Host "4. Check logs: railway logs --tail 100"
Write-Host "5. Run database migrations if needed: railway run npx prisma migrate deploy"
Write-Host ""
Write-Success "Deployment script completed!"
