"use client";

import { Flag } from 'lucide-react';

interface PrioritySelectorProps {
  selectedPriority: string;
  onChange?: (priority: 'low' | 'medium' | 'high') => void;
  isReadOnly?: boolean;
}

export default function PrioritySelector({ selectedPriority, onChange, isReadOnly = false }: PrioritySelectorProps) {
  const priorities = ['low', 'medium', 'high'] as const;
  const p = (selectedPriority || 'low').toLowerCase() as 'low' | 'medium' | 'high';

  const styles = {
    low: 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/40',
    medium: 'bg-amber-500 border-amber-400 text-white shadow-amber-500/40',
    high: 'bg-rose-500 border-rose-400 text-white shadow-rose-500/40'
  };

  // VISTA PARA LA TARJETA (Solo lectura / Badge)
  if (isReadOnly) {
    return (
      <div className={`px-3 py-1.5 rounded-xl border-2 shadow-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${styles[p]}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        {p}
      </div>
    );
  }

  // VISTA PARA FORMULARIOS (Interactivo)
  return (
    <div className="space-y-3">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Flag size={14} /> Priority Level
      </label>
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
        {priorities.map((item) => {
          const isActive = p === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange?.(item)}
              className={`
                relative py-3 rounded-xl text-[10px] font-black uppercase tracking-widest 
                transition-all duration-300 border-2
                ${isActive 
                  ? `${styles[item]} scale-100 opacity-100` 
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600 scale-95 opacity-60'
                }
              `}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}