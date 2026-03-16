import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Horarios } from './pages/Horarios';
import { Reportes } from './pages/Reportes';
import { Usuarios } from './pages/Usuarios';
import { Auditoria } from './pages/Auditoria';
import { Configuracion } from './pages/Configuracion';
import { Loader2 } from 'lucide-react';

// Dashboard con stats reales
import { useEffect, useState } from 'react';
import apiClient from './api/client';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/reports/admin/analytics/summary')
      .then(res => setSummary(res.data))
      .catch(() => {});
  }, []);

  const byStatus = (status: string) =>
    summary?.summary?.find((s: any) => s.status === status)?._count?._all ?? 0;

  const cards = [
    { label: 'Reportes Enviados',  value: byStatus('ENVIADO'),    color: 'text-blue-600' },
    { label: 'En Revisión',        value: byStatus('EN_REVISION'), color: 'text-amber-600' },
    { label: 'Resueltos',          value: byStatus('RESUELTO'),   color: 'text-green-600' },
    { label: 'Rechazados',         value: byStatus('RECHAZADO'),  color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Bienvenido, {user?.fullname?.split(' ')[0] ?? 'Admin'}
        </h1>
        <p className="text-slate-500 mt-1">Resumen operativo del sistema AguaDC</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className={`text-3xl font-extrabold mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center h-64 text-slate-400">
        <p>Gráfico de tendencias — próximamente</p>
      </div>
    </div>
  );
};

// Guard de ruta privada
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-agua-smoke">
        <Loader2 className="animate-spin text-agua-deep" size={40} />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="horarios"      element={<Horarios />} />
                <Route path="reportes"      element={<Reportes />} />
                <Route path="usuarios"      element={<Usuarios />} />
                <Route path="auditoria"     element={<Auditoria />} />
                <Route path="configuracion" element={<Configuracion />} />
                <Route path="*"             element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
