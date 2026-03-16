import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Calendar, ArrowRight, Loader2, RefreshCcw } from 'lucide-react';
import apiClient from '../api/client';

type Status = 'IDLE' | 'UPLOADING' | 'VALIDATING' | 'READY' | 'ERROR';

interface ValidationResult {
  id: string;
  period: string;
  totalColonias: number;
  valid: number;
  errors: number;
  entries: number;
  errorRows: { row: number; name: string }[];
}

export const Horarios = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('IDLE');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('IDLE');
      setResult(null);
      setErrorMsg(null);
    }
  };

  const onUpload = async () => {
    if (!file) return;
    setStatus('UPLOADING');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setStatus('VALIDATING');
      const res = await apiClient.post('/excel/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const upload = res.data;
      const meta = upload.metadata;
      const summary = meta?.summary;

      const startD = meta?.period?.startDate ? new Date(meta.period.startDate) : null;
      const endD   = meta?.period?.endDate   ? new Date(meta.period.endDate)   : null;
      const periodLabel = (startD && endD)
        ? `${startD.getDate()} - ${endD.getDate()} ${endD.toLocaleString('es-HN', { month: 'long' })} ${endD.getFullYear()}`
        : 'Período detectado';

      const errorRows = (meta?.results || [])
        .filter((r: any) => !r.isValid)
        .slice(0, 10)
        .map((r: any) => ({ row: r.row, name: r.original?.colonyName || '?' }));

      setResult({
        id: upload.id,
        period: periodLabel,
        totalColonias: summary?.totalRows ?? 0,
        valid: summary?.validRows ?? 0,
        errors: summary?.errors ?? 0,
        entries: summary?.daysProcessed ?? 0,
        errorRows,
      });
      setStatus('READY');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Error procesando el archivo. Verifica el formato.');
      setStatus('ERROR');
    }
  };

  const onPublish = async () => {
    if (!result) return;
    setPublishing(true);
    try {
      await apiClient.post('/excel/publish', { uploadId: result.id });
      setStatus('IDLE');
      setFile(null);
      setResult(null);
      alert('Período publicado exitosamente. Los horarios ya están disponibles en la app.');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al publicar. Intenta de nuevo.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Carga de Horarios Oficiales</h1>
          <p className="text-slate-500 mt-1">Sube el archivo Excel del SANAA para actualizar el sistema móvil.</p>
        </div>
      </div>

      {/* Upload Zone */}
      {!result && (
        <div className={`bg-white border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden ${
          status === 'UPLOADING' || status === 'VALIDATING'
            ? 'border-agua-deep'
            : file
              ? 'border-agua-deep bg-blue-50/20'
              : 'border-slate-200 hover:border-slate-300'
        }`}>

          {/* Premium processing overlay */}
          {(status === 'UPLOADING' || status === 'VALIDATING') && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-3xl gap-6">
              {/* Animated rings */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 rounded-full border-4 border-agua-deep/10 animate-ping" />
                <div className="absolute w-20 h-20 rounded-full border-4 border-agua-deep/20" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-agua-deep to-sky-500 flex items-center justify-center shadow-xl shadow-agua-deep/30">
                  <Loader2 size={28} className="text-white animate-spin" />
                </div>
              </div>
              {/* Step labels */}
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">
                  {status === 'UPLOADING' ? 'Subiendo archivo...' : 'Analizando datos...'}
                </p>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  {status === 'UPLOADING'
                    ? 'Transfiriendo el archivo al servidor de forma segura.'
                    : 'Validando colonias, fechas y horarios del Excel.'}
                </p>
              </div>
              {/* Step progress */}
              <div className="flex items-center gap-3">
                {[
                  { label: 'Subida',     done: true },
                  { label: 'Análisis',   done: status === 'VALIDATING' },
                  { label: 'Resultado',  done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <div className={`h-px w-8 ${step.done || status === 'VALIDATING' ? 'bg-agua-deep' : 'bg-slate-200'}`} />}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      step.done ? 'bg-agua-deep text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step.done && <CheckCircle2 size={12} />}
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${file ? 'bg-agua-deep text-white' : 'bg-slate-100 text-slate-400'}`}>
            <FileSpreadsheet size={40} />
          </div>

          <h3 className="text-xl font-bold text-slate-800">
            {file ? file.name : 'Arrastra el archivo Excel aquí'}
          </h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            El sistema detectará automáticamente el rango de fechas y las columnas de días.
          </p>

          {errorMsg && (
            <div className="mt-4 flex items-start space-x-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-md text-left">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!file ? (
            <label className="mt-8 px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer hover:bg-slate-50 transition-all shadow-sm active:scale-95 inline-block">
              Seleccionar Archivo
              <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="mt-8 flex space-x-4">
              <button
                onClick={onUpload}
                disabled={status !== 'IDLE' && status !== 'ERROR'}
                className="px-8 py-3 bg-agua-deep text-white font-bold rounded-xl shadow-lg shadow-agua-deep/20 hover:scale-105 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <><span>Procesar y Validar</span> <ArrowRight size={18} /></>
              </button>
              <button onClick={() => { setFile(null); setStatus('IDLE'); setErrorMsg(null); }} className="px-8 py-3 text-slate-500 font-bold hover:text-red-500">Cancelar</button>
            </div>
          )}
        </div>
      )}

      {/* Validation Result */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${result.errors > 0 ? 'bg-amber-400' : 'bg-green-500'} rounded-xl flex items-center justify-center text-white`}>
                  {result.errors > 0 ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Validación Completada</h3>
                  <p className="text-sm text-slate-500">Período detectado: {result.period}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => { setResult(null); setFile(null); setStatus('IDLE'); }} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <RefreshCcw size={20} />
                </button>
                <button
                  onClick={onPublish}
                  disabled={publishing}
                  className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 flex items-center space-x-2"
                >
                  {publishing ? <><Loader2 className="animate-spin" size={18}/><span>Publicando...</span></> : 'Publicar Período'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Período', value: result.period, icon: Calendar, color: 'text-blue-600' },
                { label: 'Total Colonias', value: result.totalColonias, icon: FileSpreadsheet, color: 'text-indigo-600' },
                { label: 'Válidas', value: result.valid, icon: CheckCircle2, color: 'text-green-600' },
                { label: 'Conflictos', value: result.errors, icon: AlertCircle, color: result.errors > 0 ? 'text-amber-500' : 'text-slate-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className={`p-2 rounded-lg bg-white shadow-sm w-fit mb-4 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {result.errorRows.length > 0 && (
              <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <h4 className="flex items-center space-x-2 text-amber-800 font-bold mb-4 text-sm">
                  <AlertCircle size={18} />
                  <span>Colonias no reconocidas — requieren atención</span>
                </h4>
                <div className="space-y-2">
                  {result.errorRows.map((e, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-3 bg-white/60 rounded-lg">
                      <span className="text-slate-600 font-medium">Fila {e.row}: &quot;{e.name}&quot; no reconocida</span>
                      <span className="text-amber-500 text-xs font-semibold">Sin vincular</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
