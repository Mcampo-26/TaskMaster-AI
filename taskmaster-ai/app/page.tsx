"use client";
import { useEffect, useState } from 'react';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm'; // Importamos el nuevo componente
import { ITask } from '@/models/Task';

export default function Dashboard() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden">
      <main className="flex-1 flex flex-col overflow-y-auto p-6 md:p-12">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Mis Tareas</h1>
            <p className="text-slate-400 font-medium italic">Gestionando con TaskMaster AI</p>
          </div>
          
          {/* Botón que abre el modal */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            + Nueva Tarea
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>

        {/* El Modal condicional */}
        {isModalOpen && (
          <TaskForm 
            onTaskCreated={fetchTasks} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </main>
      
      {/* Sidebar del chat... */}
    </div>
  );
}