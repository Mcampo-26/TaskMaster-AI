"use client";
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import ChatPanel from './components/ChatPanel';
import Navbar from './components/Navbar';
import { ITask } from '@/models/Task';
import { X, MessageSquare, Plus, SearchX } from 'lucide-react';

export default function KanbanDashboard() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => { fetchTasks(); }, []);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    const updatedTasks = Array.from(tasks);
    const taskIndex = updatedTasks.findIndex(t => t._id === draggableId);
    if (taskIndex !== -1) {
      updatedTasks[taskIndex].status = destination.droppableId as any;
      setTasks(updatedTasks);
      await fetch(`/api/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId }),
      });
    }
  };

  // 1. Filtramos las tareas según el buscador
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const allColumns = [
    { id: 'pending', title: 'Por hacer' },
    { id: 'in-progress', title: 'En curso' },
    { id: 'completed', title: 'Listo' }
  ];

  // 2. Lógica Clave: Solo mostramos columnas que tengan al menos una tarea filtrada
  // Si no hay búsqueda (searchTerm vacío), mostramos todas las columnas normalmente.
  const activeColumns = searchTerm === "" 
    ? allColumns 
    : allColumns.filter(col => filteredTasks.some(t => t.status === col.id));

  return (
    <div className="flex flex-col h-screen w-full bg-[#0079bf] overflow-hidden transition-colors duration-500">
      <Navbar onSearch={setSearchTerm} />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-x-auto p-6">
          
          {/* Si buscamos algo y no hay NADA en ninguna columna */}
          {searchTerm !== "" && activeColumns.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/60 animate-in fade-in zoom-in duration-300">
              <SearchX size={64} className="mb-4 opacity-20" />
              <h3 className="text-xl font-medium">No encontramos "{searchTerm}"</h3>
              <p className="text-sm">Intenta con otro nombre de tarea</p>
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-4 text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="flex gap-6 items-start h-full animate-in fade-in duration-500">
              {activeColumns.map(col => (
                <div key={col.id} className="w-[320px] shrink-0 bg-[#ebecf0] rounded-2xl flex flex-col max-h-full shadow-2xl border border-white/20">
                  <div className="p-4 flex justify-between items-center">
                    <h2 className="font-extrabold text-[#172b4d] text-sm uppercase tracking-tighter">
                      {col.title}
                    </h2>
                    <span className="bg-slate-300/50 text-[#172b4d] text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {filteredTasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>

                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={col.id}>
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-y-auto px-3 min-h-[100px] scrollbar-hide">
                          {filteredTasks.filter(t => t.status === col.id).map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id!} index={index}>
                              {(p) => (
                                <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="mb-3 transform transition-transform">
                                  <TaskCard task={task} index={index} onUpdate={fetchTasks} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="m-2 p-2 text-gray-500 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Plus size={16} /> Añadir tarjeta
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        {isChatOpen && (
          <aside className="w-[380px] border-l border-white/10 bg-[#1d2125] shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.2)] z-50">
            <ChatPanel tasks={tasks} onTaskUpdated={fetchTasks} />
          </aside>
        )}
      </div>

      {isModalOpen && <TaskForm onTaskCreated={fetchTasks} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}