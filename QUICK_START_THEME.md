# Phase 3B: Quick Start Guide - Theme Configuration

## For the Impatient: 60-Second Overview

AguaDC V2 now has a database-driven theming system. No more hardcoded colors!

### What Was Built
- ✅ Backend API with 7 endpoints (`/api/theme/*`)
- ✅ React hook for admin panel (`useTheme`)
- ✅ React Native hook for mobile (`useTheme`)
- ✅ PostgreSQL table with theme data
- ✅ 2 default themes (light, dark)
- ✅ Client-side caching (1 hour)
- ✅ Full test coverage

### What You Get

**Admin Panel**:
```typescript
const { theme } = useTheme();
// theme.colors.primary === "#003366"
```

**Mobile App**:
```typescript
const { theme } = useTheme();
// theme.colors.primary === "#003366"
```

## Quick Reference

### API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/theme/list` | GET | Public | All themes |
| `/api/theme/default` | GET | Public | Current theme |
| `/api/theme/:name` | GET | Public | Specific theme |
| `/api/theme` | POST | Admin | Create theme |
| `/api/theme/:id` | PATCH | Admin | Update theme |
| `/api/theme/:id/set-default` | PATCH | Admin | Make default |
| `/api/theme/:id` | DELETE | Admin | Delete theme |

### Test API

```bash
# Get default theme
curl http://localhost:3000/api/theme/default

# List all themes
curl http://localhost:3000/api/theme/list

# Create theme (requires JWT token)
curl -X POST http://localhost:3000/api/theme \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "custom-blue",
    "colors": { "primary": "#0066CC", ... },
    "typography": { ... },
    "spacing": { ... }
  }'
```

## Integration Examples

### React (Admin Panel)

```typescript
import { useTheme } from './hooks/useTheme';

function App() {
  const { theme, loading } = useTheme();

  if (loading) return <div>Loading theme...</div>;

  return (
    <div style={{
      '--color-primary': theme.colors.primary,
      '--color-secondary': theme.colors.secondary,
    } as React.CSSProperties}>
      {/* Your content */}
    </div>
  );
}
```

### React Native (Mobile)

```typescript
import { useTheme } from './hooks/useTheme';
import { StyleSheet, SafeAreaView } from 'react-native';

export function HomeScreen() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgrounds.primary,
    },
    text: {
      color: theme.colors.textPrimary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Your content */}
    </SafeAreaView>
  );
}
```

## Theme Structure

```typescript
{
  id: string;
  name: string;
  isDefault: boolean;
  colors: {
    primary: string;           // #003366
    secondary: string;         // #00AEEF
    accent: string;            // #F5F5F5
    textPrimary: string;       // #1F2937
    textSecondary: string;     // #6B7280
    borders: string;           // #E5E7EB
    backgrounds: {
      primary: string;        // #FFFFFF
      secondary: string;      // #F9FAFB
      tertiary: string;       // #F5F5F5
    };
    status: {
      success: string;        // #4CAF50
      warning: string;        // #FFC107
      error: string;          // #F44336
      info: string;           // #2196F3
    };
  };
  typography: {
    fontFamily: string;        // "Inter, system-ui, sans-serif"
    sizes: {
      xs: string;            // "12px"
      sm: string;            // "14px"
      base: string;          // "16px"
      lg: string;            // "18px"
      xl: string;            // "20px"
      '2xl': string;         // "24px"
    };
  };
  spacing: {
    unit: number;            // 4
    scale: {
      '1': number;          // 4
      '2': number;          // 8
      // ... more scale values
    };
  };
}
```

## Caching

### How It Works
1. Client calls `/api/theme/default`
2. Theme cached in localStorage/AsyncStorage
3. Cache valid for 1 hour
4. On next load, cache used (no API call)
5. If API fails, fallback to hardcoded theme

### Clear Cache Manually

**React**:
```typescript
const { clearCache } = useTheme();
clearCache(); // Removes from localStorage
```

**React Native**:
```typescript
const { clearCache } = useTheme();
await clearCache(); // Removes from AsyncStorage
```

## Troubleshooting

### Theme Not Loading
```typescript
const { theme, error, loading } = useTheme();
console.log({ theme, error, loading });
```

### API Not Responding
- Check if backend is running: `curl http://localhost:3000/api/theme/default`
- Check database: `npx prisma studio`
- Run migrations: `npx prisma migrate dev`

### Colors Not Applied
1. Ensure `useTheme()` hook is called
2. Verify theme object is populated
3. Check CSS variable binding
4. Verify Tailwind config if using Tailwind

## File Locations

**Key files for development**:
```
backend/src/theme/
├── theme.service.ts          ← Business logic
├── theme.controller.ts       ← API endpoints
└── theme.module.ts           ← Module config

admin-panel/src/hooks/
└── useTheme.ts              ← React hook

mobile/src/hooks/
└── useTheme.ts              ← React Native hook
```

## Deployment

### 1. Apply Migration
```bash
cd backend
npx prisma migrate deploy
```

### 2. Run Seed
```bash
npx prisma db seed
```

### 3. Verify
```bash
curl http://localhost:3000/api/theme/default
```

## Documentation Files

- **THEME_CONFIG_COMPLETE.md** — Full architecture & reference
- **PHASE_3B_IMPLEMENTATION_SUMMARY.md** — Implementation details
- **PHASE_3B_FILE_PATHS.md** — All file locations
- **QUICK_START_THEME.md** — This file

## Common Tasks

### Add a New Theme
```bash
curl -X POST http://localhost:3000/api/theme \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ocean",
    "colors": {
      "primary": "#006BA6",
      "secondary": "#0080B8",
      "accent": "#E0F0FF",
      ...
    },
    ...
  }'
```

### Switch to Dark Theme
```bash
# In admin panel or manual request:
curl -X PATCH http://localhost:3000/api/theme/<dark-theme-id>/set-default \
  -H "Authorization: Bearer <jwt>"
```

### Update Theme Colors
```bash
curl -X PATCH http://localhost:3000/api/theme/<theme-id> \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "colors": {
      "primary": "#FF0000",
      ...
    }
  }'
```

## Next Steps

1. ✅ **Now**: Review `THEME_CONFIG_COMPLETE.md` for details
2. 📋 **Then**: Integrate hooks into your components
3. 🧪 **Test**: Run `npm test` to verify tests pass
4. 🚀 **Deploy**: Follow deployment section above
5. 🎨 **Customize**: Add your own themes via API

## Support

For detailed architecture and implementation:
- See: `THEME_CONFIG_COMPLETE.md` (556 lines, comprehensive)

For deployment and setup:
- See: `PHASE_3B_IMPLEMENTATION_SUMMARY.md` (467 lines)

For file locations:
- See: `PHASE_3B_FILE_PATHS.md` (absolute paths)

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-04-06
