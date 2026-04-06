# Auth Strategy Interface - Phase 2 Complete

## Overview

AguaDC V2 now supports **pluggable authentication strategies** via the `IAuthStrategy` interface. This enables support for JWT, OAuth, Device-based auth, and future strategies (SAML, OpenID, etc.) without modifying core auth logic.

**Status**: ✅ COMPLETE
**Date**: 2026-03-30
**Phase**: Phase 2 (Auth Strategy Interface)

---

## Architecture

### Core Interfaces (`/backend/src/auth/interfaces/`)

#### 1. **IAuthStrategy** (`auth-strategy.interface.ts`)
The core pluggable interface with 7 methods:

```typescript
interface IAuthStrategy {
  authenticate(credentials: IAuthCredentials): Promise<IAuthPayload>;
  generateTokens(payload: IAuthPayload): Promise<IAuthTokens>;
  validateToken(token: string): Promise<IAuthPayload>;
  refreshToken(token: string): Promise<IAuthTokens>;
  revokeToken(token: string): Promise<void>;
  getStrategyName(): string;
  getTokenExpiration(): number;
}
```

#### 2. **IAuthPayload** (`auth-payload.interface.ts`)
Standardized authentication response:
- `sub`: User ID or device UUID
- `email`: User email (optional)
- `role`: Role name
- `permissions`: Array of permission strings
- `strategyName`: Name of auth strategy used
- `deviceUuid`: Device UUID (for device auth)

#### 3. **IAuthCredentials** (`auth-credentials.interface.ts`)
Extensible credentials input:
- `email`: User email (JWT/OAuth)
- `password`: Password (JWT)
- `deviceUuid`: Device UUID (device auth)
- Additional fields via `[key: string]: any`

#### 4. **IAuthTokens** (`auth-tokens.interface.ts`)
Token response:
- `accessToken`: JWT or device UUID
- `refreshToken`: Optional refresh token
- `expiresIn`: Expiration in seconds
- `tokenType`: 'Bearer' or other types

---

## Implementations

### 1. JWT Strategy (`jwt-auth.strategy.ts`)

**For**: Admin panel users (email/password login)

**Key Features**:
- Validates email/password with bcrypt
- Generates JWT tokens with role/permissions
- Stateless token validation
- Token refresh support
- Expiration parsing (e.g., '24h' → seconds)

**Methods**:
- `authenticate()`: Email/password validation
- `generateTokens()`: JWT signing
- `validateToken()`: JWT verification
- `refreshToken()`: Generate new JWT
- `revokeToken()`: No-op (JWT is stateless)

**Dependencies**:
- `JwtService` (NestJS)
- `UsersService` (for user lookup/validation)
- `ConfigService` (for JWT_SECRET, JWT_EXPIRATION)

---

### 2. OAuth Strategy (`oauth.strategy.ts`)

**For**: Future OAuth 2.0 integration (Google, Microsoft, GitHub, etc.)

**Status**: Stub implementation

**Methods**: All throw `NotImplementedException` with informative messages

**When Implemented**:
- Will support Google OAuth, Microsoft Entra, GitHub OAuth
- Will validate OAuth tokens against external providers
- Will create/link user accounts

---

### 3. Device Strategy (`device.strategy.ts`)

**For**: Mobile/citizen app (no login, device-based identity)

**Key Features**:
- Creates/retrieves DeviceProfile by UUID
- Generates new device UUID if not provided
- Token is the device UUID itself (simple, device-based)
- Devices never expire (1-year token expiration for practical purposes)
- Tracks platform and app version

**Methods**:
- `authenticate()`: Create/retrieve device profile
- `generateTokens()`: Return device UUID as token
- `validateToken()`: Verify device exists in DB
- `refreshToken()`: Return existing UUID
- `revokeToken()`: Delete device profile

**Dependencies**:
- `PrismaService` (for DeviceProfile)

---

## Service Architecture

### AuthService (`auth.service.ts`)

**Purpose**: Strategy router/factory

**Responsibilities**:
- Delegate to appropriate strategy by name
- Route authentication requests
- Route token generation
- List available strategies

**Key Methods**:
```typescript
async login(strategyName: string, credentials: IAuthCredentials)
async authenticate(strategyName: string, credentials: IAuthCredentials)
async generateTokens(strategyName: string, payload: IAuthPayload)
async validateToken(strategyName: string, token: string)
async refreshToken(strategyName: string, token: string)
async revokeToken(strategyName: string, token: string)
getAvailableStrategies(): string[]
```

**Design Pattern**: Strategy Pattern + Factory Pattern
- Clean separation of concerns
- Easy to add new strategies
- Minimal AuthService (10-15 lines of logic)

---

## Module Setup

### AuthModule (`auth.module.ts`)

**Providers**:
1. `JwtAuthStrategy` - JWT implementation
2. `OAuthAuthStrategy` - OAuth stub
3. `DeviceAuthStrategy` - Device implementation
4. `AUTH_STRATEGIES` factory - Map<string, IAuthStrategy>
5. `AuthService` - Strategy router

**Factory Pattern**:
```typescript
{
  provide: 'AUTH_STRATEGIES',
  useFactory: (jwtStrategy, oauthStrategy, deviceStrategy) => {
    const map = new Map<string, IAuthStrategy>();
    map.set('jwt', jwtStrategy);
    map.set('oauth', oauthStrategy);
    map.set('device', deviceStrategy);
    return map;
  },
  inject: [JwtAuthStrategy, OAuthAuthStrategy, DeviceAuthStrategy],
}
```

---

## Controller Updates

### AuthController (`auth.controller.ts`)

**Endpoints**:

#### 1. POST `/auth/login` - Strategy-based login
```json
{
  "email": "user@example.com",
  "password": "password123",
  "strategyName": "jwt"
}
```
Response:
```json
{
  "accessToken": "eyJh...",
  "expiresIn": 86400,
  "tokenType": "Bearer",
  "payload": { "sub": "user-id", "email": "...", "role": "..." }
}
```

#### 2. POST `/auth/device` - Device authentication
```json
{
  "deviceUuid": "550e8400-e29b-41d4-a716-446655440000",
  "platform": "iOS",
  "appVersion": "1.0.0"
}
```
Response:
```json
{
  "accessToken": "550e8400-e29b-41d4-a716-446655440000",
  "expiresIn": 31536000,
  "tokenType": "Bearer"
}
```

#### 3. POST `/auth/refresh` - Refresh tokens
```json
{
  "token": "eyJh...",
  "strategyName": "jwt"
}
```

#### 4. GET `/auth/strategies` - List available strategies
Response:
```json
{
  "strategies": ["jwt", "oauth", "device"],
  "timestamp": "2026-03-30T10:30:00.000Z"
}
```

#### 5. GET `/auth/profile` - Get authenticated user (JWT guard)
Response: User payload

#### 6. POST `/auth/login-local` - Legacy endpoint (backward compatible)

---

## Usage Examples

### JWT (Admin Panel)

```typescript
// Login
const response = await authService.login('jwt', {
  email: 'admin@aguadc.hn',
  password: 'password123'
});
// Response: { accessToken: "...", payload: { sub, email, role, permissions } }

// Validate token in guard
const payload = await authService.validateToken('jwt', token);

// Refresh token
const newTokens = await authService.refreshToken('jwt', oldToken);
```

### Device (Mobile App)

```typescript
// Authenticate device
const response = await authService.login('device', {
  deviceUuid: 'optional-uuid',
  platform: 'iOS',
  appVersion: '1.0.0'
});
// Response: { accessToken: "device-uuid", expiresIn: 31536000 }

// Validate device on each request (x-device-id header)
const payload = await authService.validateToken('device', deviceUuid);
```

### OAuth (Future)

```typescript
// Once implemented:
const response = await authService.login('oauth', {
  provider: 'google',
  token: 'google-oauth-token'
});
```

---

## Design Principles Applied

### ✅ Open/Closed Principle (OCP)
- Open for extension (add new strategies without modifying existing code)
- Closed for modification (core AuthService logic is stable)

### ✅ Dependency Inversion Principle (DIP)
- High-level modules (AuthService) depend on abstraction (IAuthStrategy)
- Low-level modules (JWT, OAuth, Device) implement abstraction
- No tight coupling

### ✅ Single Responsibility Principle (SRP)
- Each strategy handles one auth method
- AuthService only routes to strategies
- Clear separation of concerns

### ✅ Liskov Substitution Principle (LSP)
- Any IAuthStrategy implementation can replace another
- All strategies have consistent interface
- No behavioral surprises

---

## File Structure

```
backend/src/auth/
├── interfaces/
│   ├── auth-strategy.interface.ts
│   ├── auth-payload.interface.ts
│   ├── auth-credentials.interface.ts
│   ├── auth-tokens.interface.ts
│   └── index.ts
├── strategies/
│   ├── jwt.strategy.ts (Passport JWT - unchanged)
│   ├── local.strategy.ts (Passport Local - unchanged)
│   ├── jwt-auth.strategy.ts (IAuthStrategy implementation)
│   ├── oauth.strategy.ts (IAuthStrategy stub)
│   └── device.strategy.ts (IAuthStrategy implementation)
├── __tests__/
│   └── jwt-auth.strategy.spec.ts (test stubs ready)
├── auth.service.ts (refactored)
├── auth.controller.ts (updated)
├── auth.module.ts (updated)
├── auth.service.spec.ts (unchanged)
└── auth.controller.spec.ts (unchanged)
```

---

## Testing Status

### ✅ Phase 2 Deliverables
- [x] Interfaces defined (4 files)
- [x] JWT strategy implemented
- [x] OAuth stub created
- [x] Device strategy implemented
- [x] AuthService refactored
- [x] AuthModule with factory
- [x] AuthController updated
- [x] Test file stub created
- [x] Documentation complete

### 📋 Phase 3B: Unit Tests (Not Started)
- Test file stub: `/backend/src/auth/__tests__/jwt-auth.strategy.spec.ts`
- TODO: Implement all test cases
- TODO: Add OAuth strategy tests
- TODO: Add Device strategy tests
- TODO: Add integration tests

---

## Backward Compatibility

✅ **No Breaking Changes**

- Existing JWT endpoints still work via Passport strategy
- Legacy `/auth/login-local` endpoint available
- `JwtAuthGuard` continues to work
- All existing tests pass

---

## Future Enhancements

1. **OAuth Implementation**
   - Google OAuth (admin + citizen optional)
   - Microsoft Entra ID
   - GitHub OAuth

2. **Token Blacklist**
   - Implement stateful token revocation
   - Redis-backed blacklist for JWT

3. **Multi-Factor Authentication**
   - TOTP/2FA support
   - SMS/Email verification

4. **SAML Support**
   - Enterprise SSO integration

5. **API Key Strategy**
   - Machine-to-machine auth
   - Service account support

---

## Summary

AguaDC V2 authentication is now **fully pluggable and extensible**. The `IAuthStrategy` interface enables:

✅ JWT authentication (admin panel)
✅ Device-based authentication (mobile app)
✅ Future OAuth, SAML, API Key strategies
✅ Clean, testable architecture
✅ No breaking changes to existing code

**Authentication logic is now decoupled from business logic, following SOLID principles.**

---

**Phase 2 Status**: ✅ COMPLETE - Ready for Phase 3B (Unit Tests)
