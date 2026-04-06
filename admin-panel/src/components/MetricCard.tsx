import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, color }) => {
  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
      <div className={`p-2 rounded-lg bg-white shadow-sm w-fit mb-4 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-extrabold text-slate-800 mt-1">{value}</p>
    </div>
  );
};
