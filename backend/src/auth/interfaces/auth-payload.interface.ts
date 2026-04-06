/**
 * IAuthPayload - Standardized authentication payload
 * Represents the authenticated user/device and their permissions
 */
export interface IAuthPayload {
  sub: string;                  // Subject: user ID or device UUID
  email?: string;               // User email (optional for device auth)
  role?: string;                // Role name (e.g., 'Admin', 'Operator')
  permissions?: string[];       // Array of permission strings (e.g., ['reports:read', 'schedules:write'])
  strategyName?: string;        // Auth strategy used
  deviceUuid?: string;          // Device UUID (for mobile/device auth)
}
