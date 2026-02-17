"use client";

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import ChatPanel from './components/ChatPanel';
import { ITask } from '@/models/Task';

export default function KanbanDashboard() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => { fetchTasks(); }, []);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const updatedTasks = Array.from(tasks);
    const taskIndex = updatedTasks.findIndex(t => t._id === draggableId);
    if (taskIndex !== -1) {
      updatedTasks[taskIndex].status = destination.droppableId as any;
      setTasks(updatedTasks);
    }

    try {
      await fetch(`/api/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId }),
      });
    } catch (error) {
      fetchTasks();
    }
  };

  // Configuración de columnas estilo Trello
  const columns = [
    { id: 'pending', title: 'Por hacer' },
    { id: 'in-progress', title: 'En curso' },
    { id: 'completed', title: 'Listo' }
  ];

  return (
    /* FONDO: Azul Trello Clásico */
    <div className="flex h-screen bg-[#0079bf] text-slate-900 overflow-hidden font-sans">
      
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER: Más integrado y menos llamativo, estilo Trello */}
        <header className="px-6 py-3 flex justify-between items-center bg-black/20 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-white/80 tracking-tight">
            Taskmaster <span className="opacity-50">|</span> Boards
          </h1>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-md font-medium transition-all text-sm"
          >
            + Añadir tarjeta
          </button>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-x-auto p-4">
            <div className="flex gap-4 h-full items-start">
              {columns.map(col => (
                /* COLUMNA: Gris Trello (#ebecf0) */
                <div 
                  key={col.id} 
                  className="w-[272px] flex flex-col bg-[#ebecf0] rounded-xl shadow-md max-h-full"
                >
                  {/* Título de Columna */}
                  <div className="p-3">
                    <h2 className="font-bold text-[#172b4d] text-sm px-2">
                      {col.title}
                    </h2>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef} 
                        className="flex-1 overflow-y-auto px-2 pb-2 min-h-[50px] custom-scrollbar"
                      >
                        {tasks
                          .filter(t => t.status === col.id)
                          .map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id!} index={index}>
                              {(p) => (
                                <div className="mb-2 shadow-sm rounded-lg overflow-hidden">
                                  <TaskCard
                                    task={task}
                                    index={index}
                                    onUpdate={fetchTasks}
                                    innerRef={p.innerRef}
                                    draggableProps={p.draggableProps}
                                    dragHandleProps={p.dragHandleProps}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Pie de columna */}
                  <div className="p-2">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="w-full text-left p-2 text-[#5e6c84] hover:bg-slate-300/50 rounded-md text-sm font-medium transition-colors"
                    >
                      + Añada otra tarjeta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      </main>

      {/* CHAT PANEL: Lo ideal sería que también fuera gris claro */}
      <ChatPanel tasks={tasks} onTaskUpdated={fetchTasks} />
      
      {isModalOpen && (
        <TaskForm 
          onTaskCreated={fetchTasks} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}