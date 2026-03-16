import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Auditoria = () => (
  <div className="space-y-6 max-w-5xl mx-auto">
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Bitácora de Auditoría</h1>
      <p className="text-slate-500 mt-1">Registro de todas las acciones realizadas en el sistema</p>
    </div>
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
      <ShieldCheck size={48} className="opacity-30" />
      <p className="font-medium">Módulo de auditoría — próximamente</p>
      <p className="text-sm">Los logs son registrados automáticamente en cada operación</p>
    </div>
  </div>
);
