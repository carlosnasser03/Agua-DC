import React from 'react';
import { LayoutDashboard, Calendar, ClipboardList, Users, ShieldCheck, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, active = false }: { icon: any, label: string, to: string, active?: boolean }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',          to: '/' },
    { icon: Calendar,        label: 'Horarios',           to: '/horarios' },
    { icon: ClipboardList,   label: 'Reportes',           to: '/reportes' },
    { icon: Users,           label: 'Usuarios',           to: '/usuarios' },
    { icon: ShieldCheck,     label: 'Auditoría',          to: '/auditoria' },
    { icon: Settings,        label: 'Configuración',      to: '/configuracion' },
  ];

  const currentTitle = menuItems.find(item =>
    item.to === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.to)
  )?.label || 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-agua-smoke overflow-hidden">
      <aside className="w-64 bg-agua-deep text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-agua-deep font-bold">A</div>
            <h1 className="text-xl font-bold tracking-tight">Agua DC</h1>
          </div>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-bold">Gestión Institucional</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to)
              }
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-300 hover:text-red-100 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-bold">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">{currentTitle}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">{user?.fullname ?? 'Admin'}</p>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{user?.role ?? ''}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-agua-deep font-bold shadow-sm">
              {(user?.fullname ?? 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
