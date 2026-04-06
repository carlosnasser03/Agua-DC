/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useTheme, Theme } from '../hooks/useTheme';
import apiClient from '../api/client';

jest.mock('../api/client');

describe('useTheme (React)', () => {
  const mockTheme: Theme = {
    id: '1',
    name: 'light',
    description: 'Light theme',
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

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useTheme).toBeDefined();
  });

  it('should return initial loading state', () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTheme });

    const { result } = renderHook(() => useTheme());

    expect(result.current.loading).toBe(true);
    expect(result.current.theme).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch and set theme on mount', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTheme });

    const { result } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.theme).toEqual(mockTheme);
    expect(apiClient.get).toHaveBeenCalledWith('/theme/default');
  });

  it('should cache theme in localStorage', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTheme });

    renderHook(() => useTheme());

    await waitFor(() => {
      expect(localStorage.getItem('aguadc_theme')).toBeTruthy();
    });

    const cached = JSON.parse(localStorage.getItem('aguadc_theme') || '{}');
    expect(cached.theme).toEqual(mockTheme);
  });

  it('should use cached theme on subsequent mounts', async () => {
    const cacheData = {
      theme: mockTheme,
      timestamp: Date.now(),
    };
    localStorage.setItem('aguadc_theme', JSON.stringify(cacheData));

    const { result } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.theme).toEqual(mockTheme);
    // Should not call API if cache is valid
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('should handle fetch errors gracefully', async () => {
    const errorMessage = 'Network error';
    (apiClient.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain(errorMessage);
    expect(result.current.theme).toBeTruthy(); // Should have fallback theme
  });

  it('should refresh theme on demand', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTheme });

    const { result } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(result.current.theme).toEqual(mockTheme);
    });

    (apiClient.get as jest.Mock).mockClear();
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTheme });

    await result.current.refreshTheme();

    expect(apiClient.get).toHaveBeenCalledWith('/theme/default');
  });

  it('should clear cache', async () => {
    const cacheData = {
      theme: mockTheme,
      timestamp: Date.now(),
    };
    localStorage.setItem('aguadc_theme', JSON.stringify(cacheData));

    const { result } = renderHook(() => useTheme());

    result.current.clearCache();

    expect(localStorage.getItem('aguadc_theme')).toBeNull();
  });
});
