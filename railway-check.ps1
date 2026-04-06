# AguaDC V2 - Railway Pre-Deployment Checklist
# Verifica que todo esté listo antes de desplegar
# Usage: .\railway-check.ps1 -Environment staging|production

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("staging", "production")]
    [string]$Environment
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

# Track status
$allChecksPassed = $true

Write-Header "AguaDC V2 - Pre-Deployment Checklist ($Environment)"

# Check 1: Environment files exist
Write-Host "1. Checking environment files..." -ForegroundColor Cyan
if (Test-Path "railway.json") {
    Write-Success "railway.json found"
} else {
    Write-Error "railway.json not found in project root"
    $allChecksPassed = $false
}

if (Test-Path "backend/.env.$Environment") {
    Write-Success "backend/.env.$Environment found"
} else {
    Write-Warning "backend/.env.$Environment not found (template only, actual values will be in Railway UI)"
}

# Check 2: Git status
Write-Host "`n2. Checking Git status..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Success "Git working directory clean"
} else {
    Write-Warning "Uncommitted changes detected:"
    Write-Host $gitStatus
    Write-Host "Recommendation: Commit before deploying" -ForegroundColor Yellow
}

# Check 3: Backend structure
Write-Host "`n3. Checking backend structure..." -ForegroundColor Cyan

$requiredBackendFiles = @(
    "backend/package.json",
    "backend/Dockerfile",
    "backend/src/main.ts",
    "backend/prisma/schema.prisma"
)

$backendOK = $true
foreach ($file in $requiredBackendFiles) {
    if (Test-Path $file) {
        Write-Success "$file exists"
    } else {
        Write-Error "$file missing"
        $backendOK = $false
        $allChecksPassed = $false
    }
}

# Check 4: Node.js and npm
Write-Host "`n4. Checking Node.js and npm..." -ForegroundColor Cyan

try {
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion"
} catch {
    Write-Error "Node.js not found"
    $allChecksPassed = $false
}

try {
    $npmVersion = npm --version
    Write-Success "npm $npmVersion"
} catch {
    Write-Error "npm not found"
    $allChecksPassed = $false
}

# Check 5: Railway CLI
Write-Host "`n5. Checking Railway CLI..." -ForegroundColor Cyan

try {
    $railwayVersion = railway --version
    Write-Success "Railway CLI $railwayVersion"
} catch {
    Write-Error "Railway CLI not installed"
    Write-Info "Install with: npm install -g @railway/cli"
    $allChecksPassed = $false
}

# Check 6: Railway authentication
Write-Host "`n6. Checking Railway authentication..." -ForegroundColor Cyan

try {
    $railwayUser = railway whoami 2>&1
    if ($railwayUser -like "*not authenticated*" -or $LASTEXITCODE -ne 0) {
        Write-Error "Not authenticated with Railway"
        Write-Info "Authenticate with: railway login"
        $allChecksPassed = $false
    } else {
        Write-Success "Authenticated as: $railwayUser"
    }
} catch {
    Write-Error "Could not verify Railway authentication"
    $allChecksPassed = $false
}

# Check 7: Backend dependencies
Write-Host "`n7. Checking backend dependencies..." -ForegroundColor Cyan

if (Test-Path "backend/node_modules") {
    Write-Success "Node modules installed"
} else {
    Write-Warning "Node modules not installed locally"
    Write-Info "They will be installed during build, but you should test locally"
}

# Check 8: Code quality
Write-Host "`n8. Running code quality checks..." -ForegroundColor Cyan

Push-Location backend

try {
    # Check TypeScript compilation
    Write-Host "  - Checking TypeScript compilation..." -ForegroundColor Cyan
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "TypeScript compilation OK"
    } else {
        Write-Error "TypeScript compilation failed"
        Write-Host "  Run 'npm run build' to see details"
        $allChecksPassed = $false
    }

    # Check linting
    Write-Host "  - Running ESLint..." -ForegroundColor Cyan
    npm run lint 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Linting passed"
    } else {
        Write-Warning "Linting has issues (not blocking)"
        Write-Host "  Run 'npm run lint' to see details"
    }

    # Check tests
    Write-Host "  - Running tests..." -ForegroundColor Cyan
    npm test 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Tests passed"
    } else {
        Write-Warning "Some tests failed"
        Write-Info "Run 'npm test' to see details"
    }

} catch {
    Write-Warning "Could not run quality checks: $_"
}

Pop-Location

# Check 9: Environment variables
Write-Host "`n9. Checking environment variables configuration..." -ForegroundColor Cyan

$requiredVars = @(
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_EXPIRATION",
    "ADMIN_PANEL_URL",
    "INITIAL_ADMIN_USER",
    "INITIAL_ADMIN_PASS"
)

Write-Info "Required environment variables (must be set in Railway UI):"
foreach ($var in $requiredVars) {
    Write-Host "  - $var" -ForegroundColor Cyan
}

# Check 10: Docker configuration
Write-Host "`n10. Checking Docker configuration..." -ForegroundColor Cyan

if (Test-Path "backend/Dockerfile") {
    Write-Success "Dockerfile found"

    # Check if Dockerfile is valid
    $dockerfileContent = Get-Content "backend/Dockerfile" -Raw
    if ($dockerfileContent -match "FROM.*node" -and $dockerfileContent -match "npm.*build") {
        Write-Success "Dockerfile structure looks valid"
    } else {
        Write-Warning "Dockerfile may have issues"
    }
} else {
    Write-Error "Dockerfile not found"
    $allChecksPassed = $false
}

# Check 11: Prisma schema
Write-Host "`n11. Checking Prisma configuration..." -ForegroundColor Cyan

if (Test-Path "backend/prisma/schema.prisma") {
    Write-Success "Prisma schema found"

    # Check for datasource and generator
    $schemaContent = Get-Content "backend/prisma/schema.prisma" -Raw
    if ($schemaContent -match "datasource" -and $schemaContent -match "generator") {
        Write-Success "Prisma schema structure valid"
    } else {
        Write-Error "Prisma schema may be incomplete"
        $allChecksPassed = $false
    }
} else {
    Write-Error "Prisma schema not found"
    $allChecksPassed = $false
}

# Check 12: Data files
Write-Host "`n12. Checking required data files..." -ForegroundColor Cyan

if (Test-Path "backend/data/colonias_master.json") {
    $fileSize = (Get-Item "backend/data/colonias_master.json").Length / 1KB
    Write-Success "colonias_master.json found ($([Math]::Round($fileSize, 2)) KB)"
} else {
    Write-Warning "colonias_master.json not found (used by NormalizationService)"
}

# Final summary
Write-Header "Deployment Checklist Summary"

if ($allChecksPassed) {
    Write-Success "All critical checks passed! Ready to deploy."
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "  1. Make sure all environment variables are set in Railway UI:"
    Write-Host "     - JWT_SECRET (min 32 chars)"
    Write-Host "     - DATABASE_URL (from Railway PostgreSQL)"
    Write-Host "     - INITIAL_ADMIN_PASS (secure password)"
    Write-Host ""
    Write-Host "  2. Deploy with:"
    Write-Host "     .\deploy-script.ps1 -Environment $Environment"
    Write-Host ""
    exit 0
} else {
    Write-Error "Some critical checks failed. Please fix issues before deploying."
    Write-Host ""
    Write-Warning "To fix:"
    Write-Host "  1. Check the errors above"
    Write-Host "  2. Review backend/package.json dependencies"
    Write-Host "  3. Ensure all required files exist"
    Write-Host "  4. Run 'cd backend && npm install' if needed"
    Write-Host ""
    exit 1
}
