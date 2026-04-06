import { useEffect, useState } from 'react';
import {
  ShieldCheck, RefreshCw, Loader2,
  User, Activity, Info, ChevronLeft, ChevronRight,
  Download, X
} from 'lucide-react';
import apiClient from '../api/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditLog {
  id: string;
  userId: string | null;
  module: string;
  action: string;
  description: string;
  entityId: string | null;
  beforeData: any;
  afterData: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullname: string;
    email: string;
  };
}

interface AuditResponse {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdminUser {
  id: string;
  fullname: string;
  email: string;
}

const MODULES = [
  { value: 'users', label: 'Usuarios' },
  { value: 'schedules', label: 'Horarios' },
  { value: 'reports', label: 'Reportes' },
  { value: 'excel', label: 'Excel' },
  { value: 'config', label: 'Configuración' },
  { value: 'auth', label: 'Autenticación' },
];

const ACTIONS = [
  { value: 'CREATE', label: 'Crear' },
  { value: 'UPDATE', label: 'Actualizar' },
  { value: 'DELETE', label: 'Eliminar' },
  { value: 'VIEW', label: 'Ver' },
  { value: 'PUBLISH', label: 'Publicar' },
  { value: 'LOGIN', label: 'Login' },
];

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  VIEW: 'bg-gray-100 text-gray-700',
  PUBLISH: 'bg-purple-100 text-purple-700',
  LOGIN: 'bg-cyan-100 text-cyan-700',
};

const MODULE_COLORS: Record<string, string> = {
  users: 'bg-indigo-100 text-indigo-700',
  schedules: 'bg-emerald-100 text-emerald-700',
  reports: 'bg-orange-100 text-orange-700',
  excel: 'bg-yellow-100 text-yellow-700',
  config: 'bg-slate-100 text-slate-700',
  auth: 'bg-rose-100 text-rose-700',
};

export const Auditoria = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  // Filters
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const limit = 10;
  const totalPages = Math.ceil(totalItems / limit);

  // Fetch admins for user filter dropdown
  const fetchAdmins = async () => {
    try {
      const res = await apiClient.get<AdminUser[]>('/users');
      setAdmins(res.data || []);
    } catch {
      // Silent failure - admins list is optional
    }
  };

  // Fetch audit logs with filters
  const fetchLogs = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (selectedModule) params.append('module', selectedModule);
      if (selectedAction) params.append('action', selectedAction);
      if (selectedUser) params.append('userId', selectedUser);

      const res = await apiClient.get<AuditResponse>(`/audit?${params.toString()}`);
      setLogs(res.data.items || []);
      setTotalItems(res.data.total || 0);
      setCurrentPage(page);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al cargar auditoría';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Fetch logs when filters change
  useEffect(() => {
    fetchLogs(1);
  }, [selectedModule, selectedAction, selectedUser]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchLogs(newPage);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedModule('');
    setSelectedAction('');
    setSelectedUser('');
    setCurrentPage(1);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = [
      'ID',
      'Usuario',
      'Email',
      'Módulo',
      'Acción',
      'Descripción',
      'Entity ID',
      'IP Address',
      'Fecha'
    ];

    const rows = logs.map(log => [
      log.id,
      log.user?.fullname || 'Sistema',
      log.user?.email || 'N/A',
      log.module,
      log.action,
      log.description,
      log.entityId || 'N/A',
      log.ipAddress || 'N/A',
      format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: es })
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria-${format(new Date(), 'yyyyMMdd-HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = selectedModule || selectedAction || selectedUser;

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Auditoría del Sistema</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Registro completo de todas las acciones administrativas realizadas en el sistema.
          </p>
        </div>
        <button
          onClick={() => fetchLogs(currentPage)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Recargar
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <Info size={18} className="shrink-0 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      {/* Filters section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 to-slate-500 px-6 py-4">
          <h2 className="text-white font-bold text-base tracking-wide">Filtros</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Module filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                <Activity size={14} className="inline mr-1" />
                Módulo
              </label>
              <select
                value={selectedModule}
                onChange={e => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Todos</option>
                {MODULES.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                <ShieldCheck size={14} className="inline mr-1" />
                Acción
              </label>
              <select
                value={selectedAction}
                onChange={e => setSelectedAction(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Todas</option>
                {ACTIONS.map(a => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                <User size={14} className="inline mr-1" />
                Usuario
              </label>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Todos</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.fullname}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter actions */}
          <div className="flex gap-3 pt-2">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-all"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            )}
            <button
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Results info */}
      <div className="text-sm text-slate-600">
        Mostrando <span className="font-semibold">{(currentPage - 1) * limit + 1}</span> a{' '}
        <span className="font-semibold">
          {Math.min(currentPage * limit, totalItems)}
        </span>{' '}
        de <span className="font-semibold">{totalItems}</span> registros
      </div>

      {/* Table */}
      {logs.length === 0 ? (
        <div className="flex items-center justify-center py-12 rounded-xl border border-slate-100 bg-slate-50">
          <p className="text-slate-500 text-sm">No se encontraron registros de auditoría.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Fecha/Hora</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Usuario</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Módulo</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Acción</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Descripción</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap text-xs font-mono">
                      {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 text-xs">
                          {log.user?.fullname || 'Sistema'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {log.user?.email || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        MODULE_COLORS[log.module] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {MODULES.find(m => m.value === log.module)?.label || log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {ACTIONS.find(a => a.value === log.action)?.label || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                      <span title={log.description} className="text-xs">
                        {log.description}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono whitespace-nowrap">
                      {log.ipAddress || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) {
                  return (
                    <span key={`ellipsis-${idx}`} className="text-slate-500">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    disabled={loading}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      currentPage === p
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Footer note */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-500" />
        <p>
          El registro de auditoría captura todas las acciones administrativas incluyendo crear, actualizar, eliminar y
          ver registros. Los datos se mantienen indefinidamente para cumplimiento normativo.
        </p>
      </div>

    </div>
  );
};
