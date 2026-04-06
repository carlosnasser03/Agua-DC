import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCcw, Loader2, Calendar, FileSpreadsheet } from 'lucide-react';
import { MetricCard } from './MetricCard';

interface ValidationResult {
  id: string;
  period: string;
  totalColonias: number;
  valid: number;
  errors: number;
  entries: number;
  errorRows: { row: number; name: string }[];
}

interface ValidationResultCardProps {
  result: ValidationResult;
  isPublishing: boolean;
  onPublish: () => void;
  onReset: () => void;
}

export const ValidationResultCard: React.FC<ValidationResultCardProps> = ({
  result,
  isPublishing,
  onPublish,
  onReset,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 ${result.errors > 0 ? 'bg-amber-400' : 'bg-green-500'} rounded-xl flex items-center justify-center text-white`}
            >
              {result.errors > 0 ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Validación Completada</h3>
              <p className="text-sm text-slate-500">Período detectado: {result.period}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onReset}
              className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <RefreshCcw size={20} />
            </button>
            <button
              onClick={onPublish}
              disabled={isPublishing}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 flex items-center space-x-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Publicando...</span>
                </>
              ) : (
                'Publicar Período'
              )}
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            label="Período"
            value={result.period}
            icon={Calendar}
            color="text-blue-600"
          />
          <MetricCard
            label="Total Colonias"
            value={result.totalColonias}
            icon={FileSpreadsheet}
            color="text-indigo-600"
          />
          <MetricCard
            label="Válidas"
            value={result.valid}
            icon={CheckCircle2}
            color="text-green-600"
          />
          <MetricCard
            label="Conflictos"
            value={result.errors}
            icon={AlertCircle}
            color={result.errors > 0 ? 'text-amber-500' : 'text-slate-400'}
          />
        </div>

        {/* Error Rows Section */}
        {result.errorRows.length > 0 && (
          <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
            <h4 className="flex items-center space-x-2 text-amber-800 font-bold mb-4 text-sm">
              <AlertCircle size={18} />
              <span>Colonias no reconocidas — requieren atención</span>
            </h4>
            <div className="space-y-2">
              {result.errorRows.map((e, i) => (
                <div key={i} className="flex justify-between items-center text-sm p-3 bg-white/60 rounded-lg">
                  <span className="text-slate-600 font-medium">
                    Fila {e.row}: &quot;{e.name}&quot; no reconocida
                  </span>
                  <span className="text-amber-500 text-xs font-semibold">Sin vincular</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
