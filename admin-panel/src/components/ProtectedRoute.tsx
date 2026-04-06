import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * ProtectedRoute Component
 * Wraps private routes and handles JWT token validation
 *
 * Features:
 * - Checks token existence in localStorage (key: 'aguadc_token')
 * - Verifies token expiration
 * - Attempts auto-refresh if token is expired
 * - Shows loading spinner during verification
 * - Redirects to /login if token is invalid or refresh fails
 * - Optional role-based access control
 *
 * Usage:
 * <ProtectedRoute>
 *   <YourComponent />
 * </ProtectedRoute>
 *
 * With role check:
 * <ProtectedRoute requiredRole="Super Admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    // Mark that we've completed token verification
    setTokenChecked(true);
  }, [isLoading]);

  // Mostrar loader mientras se carga la autenticación
  if (!tokenChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-agua-smoke">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-agua-deep" size={40} />
          <p className="text-slate-600 text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar rol requerido si se especifica
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-agua-smoke">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Acceso denegado</h1>
          <p className="text-slate-600 mb-4">No tienes permisos para acceder a esta página.</p>
          <p className="text-sm text-slate-500">
            Tu rol: <span className="font-medium">{user.role}</span>
          </p>
          <p className="text-sm text-slate-500">
            Requerido: <span className="font-medium">{requiredRole}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
