/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */

import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  borders: string;
  backgrounds: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface ThemeTypography {
  fontFamily: string;
  sizes: Record<string, string>;
}

export interface ThemeSpacing {
  unit: number;
  scale: Record<string, number>;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  createdAt: string;
  updatedAt: string;
}

const THEME_STORAGE_KEY = 'aguadc_theme';
const THEME_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface CachedTheme {
  theme: Theme;
  timestamp: number;
}

/**
 * React hook for theme management
 * Fetches theme from backend on first load and caches in localStorage
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check localStorage cache first
        const cached = localStorage.getItem(THEME_STORAGE_KEY);
        if (cached) {
          try {
            const cachedData: CachedTheme = JSON.parse(cached);
            const now = Date.now();

            // Use cache if still valid
            if (now - cachedData.timestamp < THEME_CACHE_DURATION) {
              setTheme(cachedData.theme);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse cached theme', e);
            localStorage.removeItem(THEME_STORAGE_KEY);
          }
        }

        // Fetch from API
        const response = await apiClient.get<Theme>('/theme/default');
        setTheme(response.data);

        // Cache the theme
        const cacheData: CachedTheme = {
          theme: response.data,
          timestamp: Date.now(),
        };
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(cacheData));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load theme';
        console.error('Error loading theme:', message);
        setError(message);

        // Fallback to light theme if fetch fails
        setTheme(getFallbackTheme());
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  /**
   * Manually refresh theme from backend
   */
  const refreshTheme = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<Theme>('/theme/default');
      setTheme(response.data);

      // Update cache
      const cacheData: CachedTheme = {
        theme: response.data,
        timestamp: Date.now(),
      };
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to refresh theme';
      setError(message);
      console.error('Error refreshing theme:', message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear theme cache
   */
  const clearCache = () => {
    localStorage.removeItem(THEME_STORAGE_KEY);
  };

  return { theme, loading, error, refreshTheme, clearCache };
}

/**
 * Fallback theme if API is unavailable
 */
function getFallbackTheme(): Theme {
  return {
    id: 'fallback',
    name: 'light',
    description: 'Fallback light theme',
    isDefault: true,
    colors: {
      primary: '#003366',
      secondary: '#00AEEF',
      accent: '#F5F5F5',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
      borders: '#E5E7EB',
      backgrounds: {
        primary: '#FFFFFF',
        secondary: '#F9FAFB',
        tertiary: '#F5F5F5',
      },
      status: {
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
        info: '#2196F3',
      },
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      sizes: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
      },
    },
    spacing: {
      unit: 4,
      scale: {
        '1': 4,
        '2': 8,
        '3': 12,
        '4': 16,
        '6': 24,
        '8': 32,
        '12': 48,
        '16': 64,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
