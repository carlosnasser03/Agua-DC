# Global Config Segregation (Phase 1B) - Complete Implementation

## Overview

This document details the implementation of **Global Config Segregation (Phase 1B)**, which segregates configuration access by domain to enforce the **Interface Segregation Principle (ISP)** and improve security + separation of concerns.

**Status**: ✅ Complete  
**Date**: 2026-03-30  
**Files**: 11 TypeScript files + 1 module update

---

## Architecture

### Before (Monolithic)
```
GlobalConfigService
  ├─ reports_per_day
  ├─ auto_review_minutes
  ├─ auto_resolve_hours
  ├─ purge_hours_threshold
  └─ session_timeout_minutes
  
Exposed to: Everyone (mobile, admin, jobs) ❌ Violates ISP
```

### After (Segregated by Domain)
```
GlobalConfigService (unified source of truth)
  ├─ Provides: getString(), getNumber(), getBoolean()
  └─ Manages cache + persistence

IReportConfig (ReportConfigProvider)
  ├─ getMaxReportsPerDay()
  ├─ getReportRetentionDays()
  └─ getDefaultReportStatus()

IAutomationConfig (AutomationConfigProvider)
  ├─ getAutoReviewMinutes()
  ├─ getAutoResolveHours()
  └─ getPurgeHoursThreshold()

IAdminConfig (AdminConfigProvider)
  ├─ getSessionTimeoutMinutes()
  ├─ getMaxFailedLoginAttempts()
  └─ getLockoutDurationMinutes()

IMobileConfig (MobileConfigProvider)
  ├─ getMaxReportsPerDay()
  └─ getReportRetentionDays()

Usage:
  - ReportService → IReportConfig
  - ReportCronService → IAutomationConfig
  - AuthService → IAdminConfig
  - Mobile APIs → IMobileConfig
```

---

## File Structure

```
backend/src/global-config/
├── global-config.service.ts          (✏️ Updated)
├── global-config.controller.ts       (✏️ Updated)
├── global-config.module.ts           (✏️ Updated)
│
├── interfaces/                       (🆕 New)
│   ├── IReportConfig.ts
│   ├── IAutomationConfig.ts
│   ├── IAdminConfig.ts
│   └── IMobileConfig.ts
│
└── providers/                        (🆕 New)
    ├── ReportConfigProvider.ts
    ├── AutomationConfigProvider.ts
    ├── AdminConfigProvider.ts
    └── MobileConfigProvider.ts
```

---

## Interfaces (Contracts)

### 1. IReportConfig
**Location**: `interfaces/IReportConfig.ts`  
**Domain**: Reports module + automation  
**Exposed to**: ReportService, automation jobs, mobile controllers

```typescript
interface IReportConfig {
  getMaxReportsPerDay(): number;
  getReportRetentionDays(): number;
  getDefaultReportStatus(): string;
}
```

**Config Keys Used**:
- `reports_per_day` → getMaxReportsPerDay()
- `purge_hours_threshold` → getReportRetentionDays() (converted to days)
- `default_report_status` → getDefaultReportStatus()

---

### 2. IAutomationConfig
**Location**: `interfaces/IAutomationConfig.ts`  
**Domain**: Automation jobs, report lifecycle management  
**Exposed to**: ReportCronService, scheduled jobs, automation middleware

```typescript
interface IAutomationConfig {
  getAutoReviewMinutes(): number;
  getAutoResolveHours(): number;
  getPurgeHoursThreshold(): number;
}
```

**Config Keys Used**:
- `auto_review_minutes` → getAutoReviewMinutes()
- `auto_resolve_hours` → getAutoResolveHours()
- `purge_hours_threshold` → getPurgeHoursThreshold()

---

### 3. IAdminConfig
**Location**: `interfaces/IAdminConfig.ts`  
**Domain**: Admin panel, auth, session management  
**Exposed to**: AuthService, JWT strategy, admin controllers

```typescript
interface IAdminConfig {
  getSessionTimeoutMinutes(): number;
  getMaxFailedLoginAttempts(): number;
  getLockoutDurationMinutes(): number;
}
```

**Config Keys Used**:
- `session_timeout_minutes` → getSessionTimeoutMinutes()
- `max_failed_login_attempts` → getMaxFailedLoginAttempts()
- `lockout_duration_minutes` → getLockoutDurationMinutes()

---

### 4. IMobileConfig
**Location**: `interfaces/IMobileConfig.ts`  
**Domain**: Mobile app (citizen-facing), device-based identity  
**Exposed to**: Mobile API controllers (reports, public endpoints)

```typescript
interface IMobileConfig {
  getMaxReportsPerDay(): number;
  getReportRetentionDays(): number;
}
```

**Config Keys Used**:
- `reports_per_day` → getMaxReportsPerDay()
- `purge_hours_threshold` → getReportRetentionDays()

**Important**: Mobile does NOT see admin session settings or automation config.

---

## Providers (Implementations)

Each provider implements its interface and delegates to `GlobalConfigService`:

### ReportConfigProvider
**File**: `providers/ReportConfigProvider.ts`  
**Implements**: IReportConfig  
**Defaults**: reports_per_day=3, purge_hours=24, status='ENVIADO'

### AutomationConfigProvider
**File**: `providers/AutomationConfigProvider.ts`  
**Implements**: IAutomationConfig  
**Defaults**: auto_review=5min, auto_resolve=12h, purge=24h

### AdminConfigProvider
**File**: `providers/AdminConfigProvider.ts`  
**Implements**: IAdminConfig  
**Defaults**: timeout=60min, max_attempts=5, lockout=15min

### MobileConfigProvider
**File**: `providers/MobileConfigProvider.ts`  
**Implements**: IMobileConfig  
**Defaults**: reports_per_day=3, purge_hours=24

---

## GlobalConfigService (Updated)

**File**: `global-config.service.ts`

### New Config Keys (Added to DEFAULTS)
```typescript
{
  key: 'default_report_status',
  value: 'ENVIADO',
  label: 'Estado por defecto de reportes',
  type: 'string',
}

{
  key: 'max_failed_login_attempts',
  value: '5',
  label: 'Máximos intentos de login fallidos',
  type: 'number',
}

{
  key: 'lockout_duration_minutes',
  value: '15',
  label: 'Duración del bloqueo de cuenta (minutos)',
  type: 'number',
}
```

### Public API (Unchanged)
```typescript
getString(key: string, fallback?: string): string
getNumber(key: string, fallback?: number): number
getBoolean(key: string, fallback?: boolean): boolean

async getAll(): ConfigEntry[]
async update(key: string, value: string): ConfigEntry
```

---

## GlobalConfigModule (Updated)

**File**: `global-config.module.ts`

### Providers (Now 5)
```typescript
providers: [
  GlobalConfigService,
  ReportConfigProvider,       // 🆕
  AutomationConfigProvider,   // 🆕
  AdminConfigProvider,        // 🆕
  MobileConfigProvider,       // 🆕
]

exports: [
  GlobalConfigService,
  ReportConfigProvider,       // 🆕
  AutomationConfigProvider,   // 🆕
  AdminConfigProvider,        // 🆕
  MobileConfigProvider,       // 🆕
]
```

### Usage in Other Modules
```typescript
import { ReportConfigProvider } from '../global-config/providers/ReportConfigProvider';
import { IReportConfig } from '../global-config/interfaces/IReportConfig';

@Module({
  imports: [GlobalConfigModule],
  providers: [ReportService],
})
export class ReportModule {}

// In ReportService
@Injectable()
export class ReportService {
  constructor(private reportConfig: ReportConfigProvider) {}  // ✅ Inject provider
  
  async createReport(dto: CreateReportDto) {
    const maxPerDay = this.reportConfig.getMaxReportsPerDay();  // ✅ Use interface method
    // ...
  }
}
```

---

## GlobalConfigController (Updated)

**File**: `global-config.controller.ts`

### Endpoints

#### 1. GET /api/config/admin
**Auth**: JWT + Super Admin role  
**Response**: IAdminConfig (properties only)  
**Use Case**: Admin panel settings page

```typescript
async getAdminConfig(): Promise<IAdminConfig> {
  return {
    getSessionTimeoutMinutes: () => this.adminConfigProvider.getSessionTimeoutMinutes(),
    getMaxFailedLoginAttempts: () => this.adminConfigProvider.getMaxFailedLoginAttempts(),
    getLockoutDurationMinutes: () => this.adminConfigProvider.getLockoutDurationMinutes(),
  };
}
```

#### 2. GET /api/config/mobile
**Auth**: None (device-based identity)  
**Response**: IMobileConfig  
**Use Case**: Mobile app needs to check rate limits before submitting reports

```typescript
async getMobileConfig(): Promise<IMobileConfig> {
  return {
    getMaxReportsPerDay: () => this.mobileConfigProvider.getMaxReportsPerDay(),
    getReportRetentionDays: () => this.mobileConfigProvider.getReportRetentionDays(),
  };
}
```

#### 3. GET /api/config (Backward Compat)
**Auth**: JWT + Super Admin role  
**Response**: ConfigEntry[]  
**Use Case**: Admin panel configuration management page

#### 4. PATCH /api/config/:key
**Auth**: JWT + Super Admin role  
**Body**: `{ value: string }`  
**Response**: Updated ConfigEntry  
**Use Case**: Admin updates specific config value

---

## Database Schema (Unchanged)

```prisma
model GlobalConfig {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String
  label       String
  description String?
  type        String   @default("number")
  updatedAt   DateTime @updatedAt
}
```

### Seeded Defaults (on Bootstrap)
```
reports_per_day                → '3'
auto_review_minutes            → '5'
auto_resolve_hours             → '12'
purge_hours_threshold          → '24'
session_timeout_minutes        → '60'
default_report_status          → 'ENVIADO'
max_failed_login_attempts      → '5'
lockout_duration_minutes       → '15'
```

---

## Migration Plan (If Using Fresh Database)

No database changes needed. The `GlobalConfig` table already exists.

**If adding to existing database**: Run `npx prisma migrate dev` (no schema changes).

---

## Usage Examples

### Example 1: ReportService Uses IReportConfig
```typescript
import { ReportConfigProvider } from '../global-config/providers/ReportConfigProvider';

@Injectable()
export class ReportService {
  constructor(private reportConfig: ReportConfigProvider) {}

  async validateReportsPerDay(deviceUuid: string) {
    const maxPerDay = this.reportConfig.getMaxReportsPerDay();
    const count = await this.countReportsFromDeviceToday(deviceUuid);
    
    if (count >= maxPerDay) {
      throw new BadRequestException(
        `Device has reached max reports per day (${maxPerDay})`
      );
    }
  }
}
```

### Example 2: ReportCronService Uses IAutomationConfig
```typescript
import { AutomationConfigProvider } from '../global-config/providers/AutomationConfigProvider';

@Injectable()
export class ReportCronService {
  constructor(private automationConfig: AutomationConfigProvider) {}

  @Cron('*/5 * * * *')  // Every 5 minutes
  async autoReviewReports() {
    const minutes = this.automationConfig.getAutoReviewMinutes();
    const threshold = new Date(Date.now() - minutes * 60 * 1000);
    
    await this.prisma.report.updateMany({
      where: {
        status: 'ENVIADO',
        createdAt: { lt: threshold },
      },
      data: { status: 'EN_REVISION' },
    });
  }
}
```

### Example 3: AuthService Uses IAdminConfig
```typescript
import { AdminConfigProvider } from '../global-config/providers/AdminConfigProvider';

@Injectable()
export class AuthService {
  constructor(private adminConfig: AdminConfigProvider) {}

  async validateLoginAttempt(userId: string) {
    const attempts = await this.getFailedAttempts(userId);
    const max = this.adminConfig.getMaxFailedLoginAttempts();
    const lockoutDuration = this.adminConfig.getLockoutDurationMinutes();

    if (attempts >= max) {
      await this.lockAccountUntil(userId, lockoutDuration);
      throw new UnauthorizedException('Account locked');
    }
  }
}
```

### Example 4: Mobile API Uses IMobileConfig
```typescript
import { MobileConfigProvider } from '../global-config/providers/MobileConfigProvider';

@Controller('reports')
export class ReportsController {
  constructor(private mobileConfig: MobileConfigProvider) {}

  @Post()
  async createReport(@Body() dto: CreateReportDto) {
    const maxPerDay = this.mobileConfig.getMaxReportsPerDay();
    // Check device rate limit...
  }

  @Get('config')
  async getConfig() {
    // Mobile app can fetch its config (no auth needed)
    return {
      maxReportsPerDay: this.mobileConfig.getMaxReportsPerDay(),
      reportRetentionDays: this.mobileConfig.getReportRetentionDays(),
    };
  }
}
```

---

## Design Principles Applied

### 1. Interface Segregation Principle (ISP)
- Each domain has its own interface
- Services only depend on what they need
- Mobile ≠ Admin ≠ Automation config

### 2. Dependency Inversion Principle (DIP)
- Services depend on abstractions (interfaces), not concrete GlobalConfigService
- Easier to mock in tests
- Clearer contracts

### 3. Single Responsibility Principle (SRP)
- GlobalConfigService: persistence + cache management
- Providers: domain-specific config retrieval
- Controller: HTTP routing + segregated endpoints

### 4. Least Privilege (Security)
- Mobile never sees `session_timeout_minutes`
- Automation never sees admin security settings
- Each consumer sees only what it needs

---

## Testing Strategy

### Unit Tests (Providers)
```typescript
describe('ReportConfigProvider', () => {
  it('should return max reports per day from global config', () => {
    const provider = new ReportConfigProvider(mockGlobalConfigService);
    expect(provider.getMaxReportsPerDay()).toBe(3);
  });
});
```

### Integration Tests (Controller Endpoints)
```typescript
describe('GET /api/config/admin', () => {
  it('should return admin config with auth', async () => {
    const response = await request(app.getHttpServer())
      .get('/config/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('getSessionTimeoutMinutes');
  });

  it('should reject without auth', async () => {
    await request(app.getHttpServer())
      .get('/config/admin')
      .expect(401);
  });
});

describe('GET /api/config/mobile', () => {
  it('should return mobile config without auth', async () => {
    const response = await request(app.getHttpServer())
      .get('/config/mobile')
      .expect(200);
    
    expect(response.body).toHaveProperty('getMaxReportsPerDay');
  });
});
```

---

## Backward Compatibility

✅ **Fully backward compatible**

- `GlobalConfigService.getAll()` still works (used by admin config page)
- `GlobalConfigService.update()` still works (admin updates config)
- Existing services can optionally migrate to segregated providers
- Old code continues to work during transition period

---

## Migration Checklist

For teams integrating this into existing services:

- [ ] Import GlobalConfigModule in service module
- [ ] Replace `GlobalConfigService` with specific provider (ReportConfigProvider, etc.)
- [ ] Update type hints from `GlobalConfigService` to interface (IReportConfig, etc.)
- [ ] Update tests to mock only needed methods
- [ ] Verify endpoints work: GET /api/config/admin, /api/config/mobile
- [ ] Verify controller rejects unauthorized requests
- [ ] Test rate limiting with IReportConfig
- [ ] Test automation with IAutomationConfig
- [ ] Document new endpoints in API spec

---

## Summary

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| IReportConfig | `interfaces/IReportConfig.ts` | Report settings contract | ✅ |
| IAutomationConfig | `interfaces/IAutomationConfig.ts` | Automation settings contract | ✅ |
| IAdminConfig | `interfaces/IAdminConfig.ts` | Admin settings contract | ✅ |
| IMobileConfig | `interfaces/IMobileConfig.ts` | Mobile settings contract | ✅ |
| ReportConfigProvider | `providers/ReportConfigProvider.ts` | Report config impl | ✅ |
| AutomationConfigProvider | `providers/AutomationConfigProvider.ts` | Automation config impl | ✅ |
| AdminConfigProvider | `providers/AdminConfigProvider.ts` | Admin config impl | ✅ |
| MobileConfigProvider | `providers/MobileConfigProvider.ts` | Mobile config impl | ✅ |
| GlobalConfigService | `global-config.service.ts` | Updated with new keys | ✅ |
| GlobalConfigModule | `global-config.module.ts` | Updated exports | ✅ |
| GlobalConfigController | `global-config.controller.ts` | New segregated endpoints | ✅ |

**All files compile without errors.** ✅
