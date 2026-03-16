import React, { useEffect, useState } from 'react';
import {
  Settings, Save, RefreshCcw, Loader2, CheckCircle2,
  AlertCircle, Clock, Shield, Trash2, Users
} from 'lucide-react';
import apiClient from '../api/client';

interface ConfigEntry {
  id: string;
  key: string;
  value: string;
  label: string;
  description?: string;
  type: 'number' | 'string' | 'boolean';
  updatedAt: string;
}

// Icon and group metadata per key
const KEY_META: Record<string, { icon: React.ReactNode; group: string; unit?: string; min?: number; max?: number }> = {
  reports_per_day:       { icon: <AlertCircle size={18} />, group: 'Reportes Ciudadanos', unit: 'reportes/día', min: 1, max: 20 },
  auto_review_minutes:   { icon: <Clock size={18} />,       group: 'Automatización',      unit: 'minutos',     min: 1, max: 60  },
  auto_resolve_hours:    { icon: <Clock size={18} />,       group: 'Automatización',      unit: 'horas',       min: 1, max: 168 },
  purge_hours_threshold: { icon: <Trash2 size={18} />,      group: 'Mantenimiento',       unit: 'horas',       min: 1, max: 720 },
  session_timeout_minutes:{ icon: <Shield size={18} />,     group: 'Seguridad',           unit: 'minutos',     min: 5, max: 480 },
};

const GROUPS = ['Reportes Ciudadanos', 'Automatización', 'Mantenimiento', 'Seguridad'];

const GROUP_COLORS: Record<string, string> = {
  'Reportes Ciudadanos': 'from-blue-600 to-blue-500',
  'Automatización':      'from-indigo-600 to-blue-500',
  'Mantenimiento':       'from-slate-600 to-slate-500',
  'Seguridad':           'from-sky-700 to-sky-500',
};

export const Configuracion = () => {
  const [configs, setConfigs]   = useState<ConfigEntry[]>([]);
  const [drafts, setDrafts]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<Record<string, boolean>>({});
  const [saved, setSaved]       = useState<Record<string, boolean>>({});
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/config');
      setConfigs(res.data);
      const initial: Record<string, string> = {};
      res.data.forEach((c: ConfigEntry) => { initial[c.key] = c.value; });
      setDrafts(initial);
    } catch {
      // handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleChange = (key: string, val: string) => {
    setDrafts(d => ({ ...d, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
    setSaved(s => ({ ...s, [key]: false }));
  };

  const handleSave = async (cfg: ConfigEntry) => {
    const val = drafts[cfg.key];
    if (val === undefined) return;

    // Client validation
    const meta = KEY_META[cfg.key];
    if (cfg.type === 'number') {
      const n = Number(val);
      if (isNaN(n) || n < 0) {
        setErrors(e => ({ ...e, [cfg.key]: 'Debe ser un número positivo.' }));
        return;
      }
      if (meta?.min !== undefined && n < meta.min) {
        setErrors(e => ({ ...e, [cfg.key]: `Mínimo: ${meta.min}` }));
        return;
      }
      if (meta?.max !== undefined && n > meta.max) {
        setErrors(e => ({ ...e, [cfg.key]: `Máximo: ${meta.max}` }));
        return;
      }
    }

    setSaving(s => ({ ...s, [cfg.key]: true }));
    try {
      await apiClient.patch(`/config/${cfg.key}`, { value: val });
      setSaved(s => ({ ...s, [cfg.key]: true }));
      setConfigs(prev => prev.map(c => c.key === cfg.key ? { ...c, value: val } : c));
      setTimeout(() => setSaved(s => ({ ...s, [cfg.key]: false })), 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setErrors(e => ({ ...e, [cfg.key]: Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al guardar') }));
    } finally {
      setSaving(s => ({ ...s, [cfg.key]: false }));
    }
  };

  const isDirty = (key: string, originalValue: string) =>
    drafts[key] !== undefined && drafts[key] !== originalValue;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Configuración Global</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Ajusta los parámetros del sistema. Los cambios se aplican de inmediato sin reiniciar el servidor.
          </p>
        </div>
        <button
          onClick={fetchConfigs}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCcw size={15} />
          Recargar
        </button>
      </div>

      {/* Groups */}
      {GROUPS.map(group => {
        const groupConfigs = configs.filter(c => KEY_META[c.key]?.group === group);
        if (groupConfigs.length === 0) return null;
        const gradient = GROUP_COLORS[group] ?? 'from-slate-600 to-slate-500';

        return (
          <div key={group} className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden bg-white">
            {/* Group header */}
            <div className={`bg-gradient-to-r ${gradient} px-6 py-4`}>
              <h2 className="text-white font-bold text-base tracking-wide">{group}</h2>
            </div>

            {/* Config entries */}
            <div className="divide-y divide-slate-50">
              {groupConfigs.map(cfg => {
                const meta = KEY_META[cfg.key];
                const dirty = isDirty(cfg.key, cfg.value);
                const isSaving = saving[cfg.key];
                const isSaved  = saved[cfg.key];
                const error    = errors[cfg.key];

                return (
                  <div key={cfg.key} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-600">{meta?.icon}</span>
                        <span className="font-semibold text-slate-800 text-sm">{cfg.label}</span>
                      </div>
                      {cfg.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">{cfg.description}</p>
                      )}
                      {meta?.min !== undefined && meta?.max !== undefined && (
                        <p className="text-xs text-slate-400 mt-1">Rango permitido: {meta.min} – {meta.max}</p>
                      )}
                    </div>

                    {/* Input + Save */}
                    <div className="flex items-center gap-3 sm:w-64">
                      <div className="relative flex-1">
                        <input
                          type={cfg.type === 'number' ? 'number' : 'text'}
                          value={drafts[cfg.key] ?? cfg.value}
                          onChange={e => handleChange(cfg.key, e.target.value)}
                          min={meta?.min}
                          max={meta?.max}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 transition-all ${
                            error
                              ? 'border-red-300 focus:ring-red-200'
                              : dirty
                                ? 'border-blue-400 focus:ring-blue-200 bg-blue-50'
                                : 'border-slate-200 focus:ring-blue-200'
                          }`}
                        />
                        {meta?.unit && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                            {meta.unit}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleSave(cfg)}
                        disabled={!dirty || isSaving}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          isSaved
                            ? 'bg-green-100 text-green-700'
                            : dirty && !isSaving
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isSaving ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : isSaved ? (
                          <><CheckCircle2 size={13} /> Guardado</>
                        ) : (
                          <><Save size={13} /> Guardar</>
                        )}
                      </button>
                    </div>

                    {/* Error */}
                    {error && (
                      <p className="text-xs text-red-600 font-medium sm:absolute sm:mt-12">{error}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Footer note */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <Settings size={18} className="mt-0.5 shrink-0 text-blue-500" />
        <p>
          Todos los valores se persisten en base de datos y se cargan en memoria al iniciar el servidor.
          Los cambios son efectivos de inmediato — no es necesario reiniciar.
        </p>
      </div>

    </div>
  );
};
