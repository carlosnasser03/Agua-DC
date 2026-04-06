import { useEffect, useState } from 'react';
import { ClipboardList, Search, RefreshCcw, Loader2 } from 'lucide-react';
import apiClient from '../api/client';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ENVIADO:     { label: 'Enviado',     color: 'bg-blue-100 text-blue-700' },
  EN_REVISION: { label: 'En Revisión', color: 'bg-amber-100 text-amber-700' },
  VALIDADO:    { label: 'Validado',    color: 'bg-indigo-100 text-indigo-700' },
  RESUELTO:    { label: 'Resuelto',    color: 'bg-green-100 text-green-700' },
  RECHAZADO:   { label: 'Rechazado',   color: 'bg-red-100 text-red-700' },
};

const TYPE_LABELS: Record<string, string> = {
  NO_WATER:       'Sin agua',
  LOW_PRESSURE:   'Baja presión',
  WRONG_SCHEDULE: 'Horario incorrecto',
  OTHER:          'Otro',
};

export const Reportes = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchReports = () => {
    setLoading(true);
    const params: any = {};
    if (filterStatus) params.status = filterStatus;
    apiClient.get('/reports/admin', { params })
      .then(res => setReports(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [filterStatus]);

  const filtered = reports.filter(r =>
    !search ||
    r.colony?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.publicId?.toLowerCase().includes(search.toLowerCase()) ||
    r.reporterName?.toLowerCase().includes(search.toLowerCase()) ||
    r.reporterPhone?.includes(search)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reportes Ciudadanos</h1>
          <p className="text-slate-500 mt-1">Gestiona los reportes de servicio enviados desde la app</p>
        </div>
        <button onClick={fetchReports} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
          <RefreshCcw size={20} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agua-deep/20 focus:border-agua-deep"
            placeholder="Buscar por colonia o ID..."
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="pl-4 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agua-deep/20 appearance-none"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-agua-deep" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <ClipboardList size={40} className="mb-3 opacity-40" />
            <p>No hay reportes para mostrar</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">ID</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Colonia</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Tipo</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Contacto</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">IP / Huella</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => {
                const statusInfo = STATUS_LABELS[r.status] ?? { label: r.status, color: 'bg-slate-100 text-slate-600' };
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{r.publicId?.slice(0,8)?.toUpperCase()}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{r.colony?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{TYPE_LABELS[r.type] ?? r.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {r.reporterName
                        ? <><span className="font-medium">{r.reporterName}</span><br /></>
                        : null}
                      {r.reporterPhone
                        ? <span className="font-mono text-xs">{r.reporterPhone}</span>
                        : <span className="text-slate-300 text-xs">Anónimo</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 leading-5">
                      <div title={r.ipAddress ?? ''}>{r.ipAddress ?? '—'}</div>
                      <div title={r.deviceFingerprint ?? ''} className="truncate max-w-[120px]">
                        {r.deviceFingerprint ? r.deviceFingerprint.slice(0, 12) + '…' : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
