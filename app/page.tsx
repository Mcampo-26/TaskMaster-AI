"use client";
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import ChatPanel from './components/ChatPanel';
import Navbar from './components/Navbar';
import { SearchX, Plus } from 'lucide-react';

export default function KanbanDashboard() {
  const [tasks, setTasks] = useState<any[]>([]); // any[] evita errores de tipo 'never'
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    // Limpieza de datos recibidos
    const cleanData = data.map((t: any) => ({
        ...t,
        title: typeof t.title === 'object' ? (t.title?.title || "Sin título") : (t.title || "Sin título")
    }));
    setTasks(cleanData);
  };

  useEffect(() => { fetchTasks(); }, []);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const updatedTasks = Array.from(tasks);
    const taskIndex = updatedTasks.findIndex(t => t._id === draggableId);
    
    if (taskIndex !== -1) {
      updatedTasks[taskIndex].status = destination.droppableId;
      setTasks(updatedTasks);
      await fetch(`/api/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId }),
      });
    }
  };

  const filteredTasks = tasks.filter(t => {
    const search = searchTerm.toLowerCase();
    const title = String(t.title || "").toLowerCase();
    const desc = String(t.description || "").toLowerCase();
    return title.includes(search) || desc.includes(search);
  });

  const columns = [
    { id: 'pending', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'completed', title: 'Done' }
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#0079bf] overflow-hidden font-sans relative">
      <Navbar onSearch={setSearchTerm} onOpenForm={() => setIsModalOpen(true)} />

      <div className="flex-1 overflow-x-auto p-4 md:p-8 scrollbar-hide">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 md:gap-8 items-start h-full min-w-max pb-20">
            {columns.map(col => (
              <div key={col.id} className="w-[280px] md:w-[350px] shrink-0 bg-[#ebecf0] rounded-[2.5rem] flex flex-col max-h-full shadow-2xl overflow-hidden">
                <div className="p-6 flex justify-between items-center">
                  <h2 className="font-black text-[#172b4d] text-[11px] uppercase tracking-widest">{col.title}</h2>
                  <span className="bg-white/80 text-[#172b4d] text-[10px] px-3 py-1 rounded-full font-black">
                    {filteredTasks.filter(t => t.status === col.id).length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-y-auto px-4 min-h-[150px]">
                      {filteredTasks
                        .filter(t => t.status === col.id)
                        .map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(p) => (
                              <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="mb-4">
                                <TaskCard task={task} index={index} onUpdate={fetchTasks} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <button onClick={() => setIsModalOpen(true)} className="m-4 p-4 text-slate-500 hover:text-slate-900 flex items-center justify-center gap-3 transition-all">
                  <Plus size={14} /> Add New Task
                </button>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      <div className="fixed bottom-0 right-0 md:right-10 w-full md:w-[450px] z-[100] px-4 md:px-0">
        <ChatPanel tasks={tasks} onTaskUpdated={fetchTasks} />
      </div>

      {isModalOpen && <TaskForm onTaskCreated={fetchTasks} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}