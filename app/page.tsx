"use client";
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import ChatPanel from './components/ChatPanel';
import Navbar from './components/Navbar';
import { SearchX, Plus, Loader2 } from 'lucide-react';
import Footer from './components/Footer';

export default function KanbanDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      const cleanData = data.map((t: any) => ({
        ...t,
        title: typeof t.title === 'object' ? (t.title?.title || "Untitled") : (t.title || "Untitled")
      }));
      setTasks(cleanData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-[#020617] overflow-hidden font-sans relative transition-colors duration-500">
      <Navbar onSearch={setSearchTerm} onOpenForm={() => setIsModalOpen(true)} />

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="font-bold tracking-widest text-sm uppercase">Loading...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto p-4 md:p-8 scrollbar-hide">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 md:gap-8 items-start h-full min-w-max pb-20">
              {columns.map(col => (
                <div key={col.id} className="w-[300px] md:w-[450px] lg:w-[430px] shrink-0 bg-[#f1f2f4] dark:bg-[#101204] rounded-[1.5rem] flex flex-col max-h-full border border-slate-300/40 dark:border-slate-800/50 overflow-hidden">
                  <div className="p-7 flex flex-col items-center justify-center gap-2">
                    <h2 className="font-black text-slate-900 dark:text-slate-100 text-[20px] uppercase tracking-[0.2em] text-center">{col.title}</h2>
                    <span className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-3 py-1 rounded-full font-black border border-slate-200 dark:border-slate-700 shadow-sm">
                      {filteredTasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-y-auto px-4 min-h-[150px] scrollbar-hide">
                        {filteredTasks.filter(t => t.status === col.id).map((task, index) => (
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

                  <button onClick={() => setIsModalOpen(true)} className="m-6 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/30 text-slate-500 hover:text-blue-600 flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-tighter shadow-sm border border-slate-200 dark:border-transparent">
                    <Plus size={14} /> Add New Task
                  </button>
                </div>
              ))}

              {/* DESKTOP STICKY ABAJO: sticky bottom-0 y self-end lo anclan a la base del viewport */}
              <div className="hidden md:block sticky bottom-0 self-end z-[50]">
                <ChatPanel tasks={tasks} onTaskUpdated={fetchTasks} />
              </div>
            </div>
          </DragDropContext>
        </div>
      )}
      
      {/* MOBILE FIXED (Mismo margen mb-110px interno del componente) */}
      <div className="md:hidden">
        <ChatPanel tasks={tasks} onTaskUpdated={fetchTasks} />
      </div>
      <Footer />


      {isModalOpen && <TaskForm onTaskCreated={fetchTasks} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}