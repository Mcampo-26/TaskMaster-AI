"use client";
import { ITask } from '@/models/Task';
import { useState } from 'react';

interface Props {
  task: ITask;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TaskDetailModal({ task, onClose, onUpdate }: Props) {
  const [editLink, setEditLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Función Central de Actualización
  const patchTask = async (data: Partial<ITask>) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) onUpdate();
    } catch (error) {
      console.error("Error al actualizar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('¿Archivar esta tarea definitivamente?')) return;
    const res = await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
    if (res.ok) { onUpdate(); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#f4f5f7] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-8 bg-white flex justify-between items-center border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{task.title}</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
              {task.status} • {task.category || 'General'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* DESCRIPCIÓN */}
            <section>
              <h3 className="text-[11px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                <span className="text-lg">📝</span> Descripción
              </h3>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 text-slate-600 text-sm shadow-sm min-h-[100px]">
                {task.description || "Haz clic para añadir una descripción detallada..."}
              </div>
            </section>

            {/* ENLACES */}
            <section>
              <h3 className="text-[11px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                <span className="text-lg">🔗</span> Enlaces
              </h3>
              <div className="space-y-2">
                {task.links?.map((link, i) => (
                  <div key={i} className="group relative flex items-center">
                    <a href={link} target="_blank" className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-blue-600 font-bold text-xs truncate pr-10 shadow-sm">{link}</a>
                    <button 
                      onClick={() => patchTask({ links: task.links?.filter((_, idx) => idx !== i) })}
                      className="absolute right-3 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mt-4 border border-slate-200 shadow-inner focus-within:bg-white transition-all">
                  <input 
                    type="text" placeholder="Añadir enlace..." 
                    className="flex-1 bg-transparent px-3 text-xs font-bold outline-none"
                    value={editLink} onChange={(e) => setEditLink(e.target.value)}
                  />
                  <button 
                    onClick={() => { patchTask({ links: [...(task.links || []), editLink] }); setEditLink(''); }}
                    disabled={!editLink || isSaving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 disabled:opacity-50"
                  >Añadir</button>
                </div>
              </div>
            </section>
          </div>

          {/* ACCIONES LATERALES */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gestión</h3>
            
            <button 
              onClick={() => {
                const cat = prompt("Nueva categoría:", task.category);
                if (cat) patchTask({ category: cat });
              }}
              className="w-full text-left p-4 bg-white hover:bg-blue-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 flex items-center gap-3 transition-all shadow-sm"
            >
              🏷️ Etiqueta
            </button>

            {/* CALENDARIO REAL CONECTADO A DB */}
            <div className="w-full p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <label className="flex items-center gap-3 text-xs font-bold text-slate-600 mb-2 cursor-pointer">
                <span>📅</span> Fecha límite
              </label>
              <input 
                type="date" 
                className="w-full bg-slate-50 p-2 rounded-lg text-[11px] font-bold text-slate-500 outline-none border border-transparent focus:border-blue-400 transition-all cursor-pointer"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => patchTask({ dueDate: e.target.value })}
              />
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 space-y-2">
              <p className="text-[9px] font-black text-rose-300 uppercase px-2 mb-2 tracking-widest">Peligro</p>
              <button 
                onClick={handleArchive}
                className="w-full text-left p-4 bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-100 rounded-2xl text-xs font-black text-rose-500 flex items-center gap-3 transition-all shadow-sm"
              >
                🗑️ Archivar Tarea
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}