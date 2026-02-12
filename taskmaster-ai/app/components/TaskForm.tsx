"use client";
import { useState } from 'react';
import { ITask } from '@/models/Task';

interface TaskFormProps {
  onTaskCreated: () => void; // Para avisarle al Dashboard que refresque la lista
  onClose: () => void;       // Para cerrar el modal
}

export default function TaskForm({ onTaskCreated, onClose }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ITask['priority']>('medium');
  const [issubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("El título es obligatorio");

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
          userId: 'user_maury', // ID temporal
        }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        onTaskCreated(); // Refrescamos la lista
        onClose();       // Cerramos el modal
      }
    } catch (error) {
      console.error("Error al crear tarea:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form 
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-white">Nueva Tarea</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Título</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
              placeholder="Ej: Comprar café"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Descripción</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all h-24"
              placeholder="Detalles de la tarea..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Prioridad</label>
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 transition-all text-slate-300 font-medium"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={issubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-3 rounded-xl text-white font-bold transition-all"
          >
            {issubmitting ? 'Guardando...' : 'Crear Tarea'}
          </button>
        </div>
      </form>
    </div>
  );
}