"use client";
import { ITask } from '@/models/Task';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X, CheckCircle2, MessageSquare, Link as LinkIcon, Calendar, Flag, Clock, Plus, Tag, ImageIcon } from 'lucide-react';
import PrioritySelector from './PrioritySelector';

interface Props {
  task: ITask;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TaskDetailModal({ task, onClose, onUpdate }: Props) {
  const [mounted, setMounted] = useState(false);
  const [tempTask, setTempTask] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
    category: task.category || "General",
    imageUrl: task.imageUrl || ""
  });

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const [editLink, setEditLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const adjustTitleHeight = () => {
      if (titleRef.current) {
        titleRef.current.style.height = 'auto';
        titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
      }
    };
    adjustTitleHeight();
    window.addEventListener('resize', adjustTitleHeight);
    return () => window.removeEventListener('resize', adjustTitleHeight);
  }, [tempTask.title, mounted]);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!mounted) return null;

  const dateCreated = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
    : "Today";

  const hasChanges =
    tempTask.title !== task.title ||
    tempTask.description !== (task.description || "") ||
    tempTask.priority !== task.priority ||
    tempTask.dueDate !== (task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "") ||
    tempTask.category !== (task.category || "General") ||
    tempTask.imageUrl !== (task.imageUrl || "");

  const handleAddLink = async () => {
    if (!editLink.trim()) return;
    const res = await fetch(`/api/tasks/${task._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links: [...(task.links || []), editLink.trim()] }),
    });
    if (res.ok) { onUpdate(); setEditLink(''); }
  };

  const handleDeleteLink = async (index: number) => {
    const newLinks = task.links?.filter((_, i) => i !== index);
    const res = await fetch(`/api/tasks/${task._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links: newLinks }),
    });
    if (res.ok) onUpdate();
  };

  const handleSaveChanges = async () => {
    if (!tempTask.title.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempTask),
      });
      if (res.ok) {
        setShowAlert(true);
        onUpdate();
        setTimeout(() => onClose(), 800);
      }
    } finally { setIsSaving(false); }
  };

  return createPortal(
    <div
      className="fixed inset-0 w-screen h-screen bg-slate-950/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {showAlert && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100000] animate-in slide-in-from-top-8">
          <div className="bg-emerald-500 text-white px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest">
            <CheckCircle2 size={20} className="animate-bounce" /> Changes Synced
          </div>
        </div>
      )}

      <div
        className="bg-white dark:bg-[#0b1120] w-full max-w-4xl h-full max-h-[80vh] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÓN CERRAR FLOTANTE */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:rotate-90 transition-all duration-300 z-[60] shadow-sm"
        >
          <X size={20} />
        </button>

        {/* CONTENIDO PRINCIPAL CON SCROLL */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full">

            {/* COLUMNA IZQUIERDA: EDITOR */}
            <div className="lg:col-span-7 p-8 md:p-14 space-y-10 border-r border-slate-100 dark:border-slate-800/50">
              <header className="space-y-4">
                <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">
                  <Clock size={14} /> Created {dateCreated}
                </div>
                <textarea
                  ref={titleRef}
                  value={tempTask.title}
                  onChange={(e) => setTempTask({ ...tempTask, title: e.target.value })}
                  rows={1}
                  className="w-full bg-transparent border-none outline-none focus:ring-0 resize-none overflow-hidden text-3xl md:text-5xl font-black text-slate-900 dark:text-white placeholder:text-slate-200 leading-tight tracking-tighter"
                  placeholder="Task title..."
                />
              </header>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <MessageSquare size={16} /> Description
                </label>
                <textarea
                  value={tempTask.description}
                  onChange={(e) => setTempTask({ ...tempTask, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-base outline-none focus:border-blue-500/50 transition-all resize-none min-h-[200px]"
                  placeholder="Add more details about this task..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <LinkIcon size={16} /> Links
                </label>
                <div className="space-y-2">
                  {task.links?.map((link, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all">
                      <a href={link} target="_blank" rel="noreferrer" className="flex-1 text-blue-500 font-bold text-sm truncate">{link}</a>
                      <button onClick={() => handleDeleteLink(i)} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <input
                      type="text"
                      placeholder="Add link..."
                      className="flex-1 bg-transparent px-4 text-sm outline-none text-slate-600 dark:text-slate-200"
                      value={editLink}
                      onChange={(e) => setEditLink(e.target.value)}
                    />
                    <button onClick={handleAddLink} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3 rounded-xl hover:scale-105 transition-transform">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: CONFIGURACIÓN */}
            <div className="lg:col-span-5 bg-slate-50/50 dark:bg-black/10 p-8 md:p-14 space-y-8 overflow-y-auto">

              {/* PREVIEW DE IMAGEN */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
                  <ImageIcon size={16} className="text-blue-500/70" />
                  Cover Image
                </label>

                {/* Preview de la imagen mejorado */}
                <div className="relative group aspect-video w-full rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all duration-500 hover:border-blue-400/50">
                  {tempTask.imageUrl ? (
                    <>
                      <img src={tempTask.imageUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                        <ImageIcon size={24} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Image Preview</span>
                    </div>
                  )}
                </div>

                {/* Input de URL con estilo "Lindo" */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={tempTask.imageUrl}
                    onChange={(e) => setTempTask({ ...tempTask, imageUrl: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 
                 px-5 py-4 rounded-2xl outline-none transition-all duration-300
                 /* Estética de Texto */
                 text-sm font-medium text-slate-700 dark:text-slate-200 
                 placeholder:text-slate-400/50 placeholder:font-normal
                 /* Foco y sombras */
                 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/50 
                 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                  />

                  {/* Indicador visual de URL válida (opcional) */}
                  {tempTask.imageUrl && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* PRIORIDADES */}
              <PrioritySelector 
  selectedPriority={tempTask.priority} 
  onChange={(val) => setTempTask({ ...tempTask, priority: val })} 
/>
              {/* CATEGORÍA Y FECHA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                    <Tag size={14} className="text-blue-500/70" />
                    Category
                  </label>

                  <div className="relative group">
                    <input
                      type="text"
                      value={tempTask.category}
                      onChange={(e) => setTempTask({ ...tempTask, category: e.target.value })}
                      placeholder="Ej: Diseño, Backend..."
                      className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 
                 px-5 py-4 rounded-2xl outline-none transition-all duration-300
                 
                 /* Estilo del Texto: Aquí está la magia */
                 text-sm font-semibold text-slate-700 dark:text-slate-100 placeholder:text-slate-400/70
                 tracking-tight leading-relaxed
                 
                 /* Efectos al hacer foco y hover */
                 hover:border-slate-300 dark:hover:border-slate-600
                 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/50 
                 focus:ring-4 focus:ring-blue-500/10 shadow-sm focus:shadow-md"
                    />

                    {/* Un detalle estético: línea de brillo inferior solo cuando pasas el mouse */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-focus-within:w-[40%] opacity-50 rounded-full" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Calendar size={14} /> Due Date
                  </label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={tempTask.dueDate}
                      onChange={(e) => setTempTask({ ...tempTask, dueDate: e.target.value })}
                      onClick={(e) => (e.target as any).showPicker?.()}
                      // Agregado: text-slate-900 y dark:text-white + color-scheme para el icono nativo
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-4 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none appearance-none cursor-pointer focus:ring-2 ring-blue-500/20 transition-all dark:color-scheme-dark
        [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                    {!tempTask.dueDate && (
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Calendar size={14} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* BOTÓN GUARDAR */}
              <button
                onClick={handleSaveChanges}
                disabled={isSaving || !hasChanges}
                className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all ${hasChanges
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-500 active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
              >
                {isSaving ? "Syncing..." : "Update Task"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}