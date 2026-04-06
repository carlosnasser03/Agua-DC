# ProtectedRoute Implementation - AguaDC Admin Panel

## Overview

The ProtectedRoute component has been implemented to secure all private routes in the admin panel. It handles JWT token validation, automatic token refresh, and role-based access control.

## Components & Files Modified

### 1. ProtectedRoute Component
**File**: `/admin-panel/src/components/ProtectedRoute.tsx`

A React component that wraps private routes and ensures:
- Token existence verification in localStorage (`aguadc_token`)
- Token expiration checking
- Automatic token refresh attempt for expired tokens
- Loading state display during verification
- Redirect to login if token invalid/expired or refresh fails
- Optional role-based access control

**Props**:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;  // Optional: restrict access to specific role
}
```

**Usage**:
```tsx
// Basic protection
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// With role restriction
<ProtectedRoute requiredRole="Super Admin">
  <AdminPanel />
</ProtectedRoute>
```

### 2. AuthContext (Enhanced)
**File**: `/admin-panel/src/context/AuthContext.tsx`

Major additions:
- **`refreshToken()` method**: Calls `POST /api/auth/refresh` to obtain new token
- **Token expiration checking**: Decodes JWT and verifies `exp` claim
- **Session restoration**: On app mount, checks saved token validity and attempts refresh if expired
- **Event listeners**:
  - `storage` event: Syncs logout across browser tabs
  - `auth:logout` event: Custom event from API interceptor when refresh fails

**Key Functions**:
- `decodeJWT()`: Manually decodes JWT payload without external library
- `isTokenExpired()`: Checks if token's `exp` claim has passed
- `clearSession()`: Removes token/user from storage and state
- `refreshToken()`: Calls refresh endpoint and updates storage

### 3. API Client (Enhanced)
**File**: `/admin-panel/src/api/client.ts`

Implements response interceptor with auto-refresh logic:

**Flow on 401 Response**:
1. If status is 401 and not a refresh request:
2. If already refreshing, queue request and wait for new token
3. If not refreshing, initiate refresh:
   - POST to `/auth/refresh` with current token
   - Save new token to localStorage
   - Retry all queued requests with new token
4. If refresh fails:
   - Clear session from storage
   - Dispatch `auth:logout` event
   - Redirect to `/login`

**Key Features**:
- Queue system prevents multiple simultaneous refresh attempts
- Request deduplication via `failedQueue`
- Automatic retry of failed requests after token refresh
- Fallback to login on refresh failure

### 4. App Routes (Updated)
**File**: `/admin-panel/src/App.tsx`

All protected routes now wrapped with `<ProtectedRoute>`:
- `/` (Dashboard)
- `/horarios` (Schedules)
- `/reportes` (Reports)
- `/usuarios` (Users)
- `/auditoria` (Audit Log)
- `/configuracion` (Configuration)

Login route remains unprotected.

## Token Lifecycle

### 1. Login
```
User enters credentials → POST /auth/login → Response: { access_token, user }
→ Store token in localStorage → Store user in AuthContext
```

### 2. Request with Token
```
Every request → Request interceptor attaches Authorization header
→ Authorization: Bearer {token} → Send request
```

### 3. Token Expiration (On Protected Route Access)
```
User navigates to protected route → ProtectedRoute checks token
→ Token expired → AuthContext calls refreshToken()
→ POST /auth/refresh → Response: { access_token }
→ Update localStorage → Update AuthContext
→ Render component
```

### 4. Refresh Fails or 401 Response
```
Refresh fails → Clear localStorage
→ Dispatch auth:logout event
→ AuthContext clears state
→ API interceptor redirects to /login
```

## Storage Keys

- **Token**: `aguadc_token` (localStorage)
- **User**: `aguadc_user` (localStorage)

Both are cleared on logout or refresh failure.

## Backend Endpoint Requirements

The backend must provide:
```
POST /api/auth/refresh
Headers: Authorization: Bearer {expired_token}
Response: { access_token: "new_jwt_token" }
Status: 200 on success, 401 on failure
```

## User Experience

### Loading State
- Spinner shown with message "Verificando sesión..." while checking token

### Expired Token Redirect
- User session expired → Automatic refresh attempt → If successful, transparent to user
- If refresh fails → Redirect to login with message about expired session

### Access Denied
- User without required role → Display "Acceso denegado" message with role info
- User not authenticated → Redirect to login

### Multi-Tab Sync
- Logout in one tab → Other tabs automatically detect via `storage` event
- Session expiry → All tabs handle via `auth:logout` event

## Error Handling

### Scenarios Handled
1. Token missing → Redirect to login
2. Token expired but refresh available → Auto-refresh, retry request
3. Token expired, refresh fails → Clear session, redirect to login
4. 401 on non-refresh endpoints → Attempt refresh, retry, or fail gracefully
5. 401 on refresh endpoint → Clear session, redirect to login

### Network Errors
- Refresh network timeout → Request queued, retried with same token
- Subsequent 401 → Attempt refresh again

## Testing Checklist

- [ ] Login works and token stored in localStorage
- [ ] Protected routes require authentication
- [ ] Unauthenticated user redirected to /login
- [ ] Token expiration triggers auto-refresh
- [ ] Expired token refresh works correctly
- [ ] Request retried after refresh
- [ ] Refresh failure logs user out
- [ ] Role-based access control works
- [ ] Multi-tab logout syncs correctly
- [ ] Network errors handled gracefully
- [ ] Logout clears storage and state
- [ ] Login after logout works

## Configuration

### Environment Variables
```
VITE_API_URL=http://localhost:3000/api
```

### Token Format
JWT tokens should include:
- `exp`: Expiration time (seconds since epoch)
- `sub`/`id`: User ID
- `email`: User email
- `role`: User role

## Future Enhancements

1. **Refresh token rotation**: Implement refresh token strategy
2. **Silent refresh**: Refresh token 5 minutes before expiry (not on-demand)
3. **Role-based routes**: Combine ProtectedRoute with role checking in route config
4. **Token blacklist**: Track logout tokens server-side
5. **Biometric re-auth**: Prompt for re-auth on sensitive operations
6. **Session timeout**: Auto-logout after period of inactivity

## Debugging

Enable console logging in AuthContext and API client:
```javascript
// In AuthContext useEffect
console.log('Token restored:', !!token);

// In API interceptor
console.error('Token refresh failed:', error?.response?.status);
```

Monitor localStorage:
```javascript
// Check token
localStorage.getItem('aguadc_token')

// Check user
JSON.parse(localStorage.getItem('aguadc_user'))
```

## References

- File: `/admin-panel/src/components/ProtectedRoute.tsx`
- File: `/admin-panel/src/context/AuthContext.tsx`
- File: `/admin-panel/src/api/client.ts`
- File: `/admin-panel/src/App.tsx`
