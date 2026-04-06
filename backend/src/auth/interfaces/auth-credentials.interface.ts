/**
 * IAuthCredentials - Base credentials interface
 * Extensible for different auth strategies
 */
export interface IAuthCredentials {
  email?: string;               // Email (for JWT/OAuth)
  password?: string;            // Password (for JWT)
  deviceUuid?: string;          // Device UUID (for device auth)
  [key: string]: any;           // Allow extensibility for OAuth, SAML, etc.
}
