import React, { useState } from 'react';
import { ExcelUploadZone } from '../components/ExcelUploadZone';
import { ValidationResultCard } from '../components/ValidationResultCard';
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

  const onReset = () => {
    setResult(null);
    setFile(null);
    setStatus('IDLE');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Carga de Horarios Oficiales</h1>
          <p className="text-slate-500 mt-1">Sube el archivo Excel del SANAA para actualizar el sistema móvil.</p>
        </div>
      </div>

      {!result && (
        <ExcelUploadZone
          file={file}
          status={status}
          errorMsg={errorMsg}
          onFileChange={handleFileChange}
          onUpload={onUpload}
        />
      )}

      {result && (
        <ValidationResultCard
          result={result}
          isPublishing={publishing}
          onPublish={onPublish}
          onReset={onReset}
        />
      )}
    </div>
  );
};
