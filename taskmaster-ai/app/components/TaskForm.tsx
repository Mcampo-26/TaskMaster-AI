"use client";
import { useState } from 'react';
import { ITask } from '@/models/Task';

interface TaskFormProps {
  onTaskCreated: () => void;
  onClose: () => void;
}

export default function TaskForm({ onTaskCreated, onClose }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ITask['priority']>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  // --- FUNCIÓN DE IA MAGIC ---
  const handleAiMagic = async () => {
    if (!title.trim()) return alert("Escribe un título corto para que la IA te ayude");
    
    setIsMagicLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `Analiza esta tarea: "${title}". 
          Devuelve SOLO un JSON con este formato: 
          {"description": "una descripción útil", "priority": "low" o "medium" o "high"}` 
        }),
      });
      
      const data = await res.json();
      // Parseamos la respuesta de Gemini (asumiendo que devuelve el JSON limpio)
      const aiContent = JSON.parse(data.text.replace(/```json|```/g, ''));
      
      setDescription(aiContent.description);
      setPriority(aiContent.priority);
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
          priority,
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <form 
        onSubmit={handleSubmit}
        className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden"
      >
        {/* Decoración sutil de fondo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full"></div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight">Crear Tarea</h2>
          <button 
            type="button"
            onClick={handleAiMagic}
            disabled={isMagicLoading || !title}
            className="group relative flex items-center gap-2 bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-2 rounded-xl text-xs font-bold text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all disabled:opacity-30 active:scale-95"
          >
            {isMagicLoading ? '🪄 Pensando...' : '✨ IA Magic'}
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="group">
            <label className="block text-xs uppercase tracking-widest font-black text-slate-500 mb-2 ml-1">¿Qué hay que hacer?</label>
            <input 
              autoFocus
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 ring-blue-500/50 outline-none transition-all text-white text-lg placeholder:text-slate-700"
              placeholder="Ej: Turno odontólogo"
            />
          </div>

          <div className="group">
            <label className="block text-xs uppercase tracking-widest font-black text-slate-500 mb-2 ml-1">Notas Adicionales</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 ring-blue-500/50 outline-none transition-all h-32 text-slate-300 resize-none placeholder:text-slate-700"
              placeholder="La IA puede rellenar esto por ti..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-black text-slate-500 mb-2 ml-1">Prioridad</label>
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${
                      priority === p 
                        ? 'bg-slate-800 text-white shadow-inner' 
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl text-slate-400 font-bold hover:bg-slate-800 transition-all active:scale-95"
          >
            Cerrar
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] bg-white text-black hover:bg-blue-50 disabled:opacity-50 px-6 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95"
          >
            {isSubmitting ? 'Guardando...' : 'Confirmar Tarea'}
          </button>
        </div>
      </form>
    </div>
  );
}