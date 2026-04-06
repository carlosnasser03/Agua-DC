import React from 'react';
import { FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

type Status = 'IDLE' | 'UPLOADING' | 'VALIDATING' | 'READY' | 'ERROR';

interface ExcelUploadZoneProps {
  file: File | null;
  status: Status;
  errorMsg: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

export const ExcelUploadZone: React.FC<ExcelUploadZoneProps> = ({
  file,
  status,
  errorMsg,
  onFileChange,
  onUpload,
}) => {
  const handleReset = () => {
    // Reseteamos el input file buscándolo en el DOM
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    onFileChange({
      target: { files: null },
    } as any);
  };

  return (
    <div
      className={`bg-white border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden ${
        status === 'UPLOADING' || status === 'VALIDATING'
          ? 'border-agua-deep'
          : file
            ? 'border-agua-deep bg-blue-50/20'
            : 'border-slate-200 hover:border-slate-300'
      }`}
    >
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
              { label: 'Subida', done: true },
              { label: 'Análisis', done: status === 'VALIDATING' },
              { label: 'Resultado', done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className={`h-px w-8 ${step.done || status === 'VALIDATING' ? 'bg-agua-deep' : 'bg-slate-200'}`}
                  />
                )}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    step.done ? 'bg-agua-deep text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
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

      <h3 className="text-xl font-bold text-slate-800">{file ? file.name : 'Arrastra el archivo Excel aquí'}</h3>
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
          <input type="file" className="hidden" accept=".xlsx,.xls" onChange={onFileChange} />
        </label>
      ) : (
        <div className="mt-8 flex space-x-4">
          <button
            onClick={onUpload}
            disabled={status !== 'IDLE' && status !== 'ERROR'}
            className="px-8 py-3 bg-agua-deep text-white font-bold rounded-xl shadow-lg shadow-agua-deep/20 hover:scale-105 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <>
              <span>Procesar y Validar</span> <ArrowRight size={18} />
            </>
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 text-slate-500 font-bold hover:text-red-500"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};
