"use client";
import { useState } from 'react';
import { ITask } from '@/models/Task';
import { Calendar, Sparkles, Tag, X } from 'lucide-react';

interface TaskFormProps {
  onTaskCreated: () => void;
  onClose: () => void;
}

export default function TaskForm({ onTaskCreated, onClose }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<ITask['priority']>('medium');
  const [dueDate, setDueDate] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  const handleAiMagic = async () => {
    if (!title.trim()) return alert("Escribe un título para que la IA te ayude");
    
    setIsMagicLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `Analiza esta tarea: "${title}". 
          Devuelve SOLO un JSON con este formato: 
          {"description": "una descripción útil", "priority": "low"|"medium"|"high", "dueDate": "YYYY-MM-DD", "category": "una palabra para clasificar"}` 
        }),
      });
      
      const data = await res.json();
      const aiContent = JSON.parse(data.text.replace(/```json|```/g, ''));
      
      setDescription(aiContent.description);
      setPriority(aiContent.priority);
      if (aiContent.dueDate) setDueDate(aiContent.dueDate);
      if (aiContent.category) setCategory(aiContent.category);
      
    } catch (error) {
      console.error("Error con Magic IA:", error);
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          dueDate: dueDate || null,
          status: 'pending',
          userId: 'user_maury',
        }),
      });

      if (res.ok) {
        onTaskCreated();
        onClose();
      }
    } catch (error) {
      console.error("Error al crear:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-md flex items-center justify-center z-[250] p-4 animate-in fade-in duration-300">
      <form 
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden transition-colors duration-300"
      >
        {/* Decoración de fondo (Solo visible en dark para el toque pro) */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/5 dark:bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Nueva Tarea</h2>
          <button 
            type="button"
            onClick={handleAiMagic}
            disabled={isMagicLoading || !title}
            className="group relative flex items-center gap-2 bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:shadow-lg transition-all disabled:opacity-30 active:scale-95"
          >
            {isMagicLoading ? '🪄 Pensando...' : <><Sparkles size={14}/> IA Magic</>}
          </button>
        </div>
        
        <div className="space-y-6">
          {/* TÍTULO */}
          <div className="group">
            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-2 ml-1">Título</label>
            <input 
              autoFocus
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 ring-blue-500/50 outline-none transition-all text-slate-900 dark:text-white text-lg placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-sm dark:shadow-inner"
              placeholder="¿Qué tienes en mente?"
            />
          </div>

          {/* CATEGORÍA */}
          <div className="group">
            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-2 ml-1 flex items-center gap-2">
              <Tag size={12} /> Categoría
            </label>
            <input 
              type="text" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 focus:ring-2 ring-blue-500/50 outline-none transition-all text-slate-900 dark:text-white text-sm placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-sm"
              placeholder="Ej: Trabajo, Personal..."
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="group">
            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-2 ml-1">Descripción</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 ring-blue-500/50 outline-none transition-all h-28 text-slate-700 dark:text-slate-300 resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-sm shadow-sm dark:shadow-inner"
              placeholder="Detalles adicionales..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PRIORIDAD */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-2 ml-1">Prioridad</label>
              <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${
                      priority === p 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md dark:shadow-black/20' 
                        : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* FECHA DE VENCIMIENTO */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-2 ml-1 flex items-center gap-2">
                <Calendar size={12} /> Vencimiento
              </label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-slate-300 text-xs font-bold outline-none focus:ring-2 ring-blue-500/50 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl text-slate-400 dark:text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs uppercase"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-blue-50 disabled:opacity-50 px-6 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest"
          >
            {isSubmitting ? 'Guardando...' : 'Crear Tarea'}
          </button>
        </div>
      </form>
    </div>
  );
}