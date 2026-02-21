"use client";
import { ITask } from '@/models/Task';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X, CheckCircle2, MessageSquare, Link as LinkIcon, Calendar, Flag, Clock, Plus, Tag } from 'lucide-react';

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
    category: task.category || "General"
  });

  const [editLink, setEditLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Scroll lock and portal mounting
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
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
    tempTask.category !== (task.category || "General");

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
      className="fixed inset-0 w-screen h-screen bg-slate-950/80 backdrop-blur-xl z-[99999] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
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
        className="bg-white dark:bg-[#0f172a] w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800 relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:rotate-90 transition-all duration-300 z-50 shadow-sm"
        >
          <X size={24} />
        </button>

        {/* INTERNAL CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* LEFT SIDE: TEXTS */}
            <div className="lg:col-span-8 space-y-12">
              <header className="space-y-4">
                <div className="flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-[0.3em]">
                  <Clock size={16} /> Registered on {dateCreated}
                </div>
                <input 
                  value={tempTask.title}
                  onChange={(e) => setTempTask({...tempTask, title: e.target.value})}
                  className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white bg-transparent border-none outline-none w-full focus:ring-0 placeholder:text-slate-200 leading-tight tracking-tighter"
                  placeholder="Task title..."
                />
              </header>

              <div className="space-y-6">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <MessageSquare size={20} /> Detailed Description
                </label>
                <textarea 
                  value={tempTask.description}
                  onChange={(e) => setTempTask({...tempTask, description: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-lg outline-none focus:border-blue-500/50 transition-all resize-none min-h-[250px] leading-relaxed shadow-inner"
                  placeholder="Write project notes here..."
                />
              </div>

              {/* LINKS SECTION */}
              <div className="space-y-6">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <LinkIcon size={20} /> Resources & Links
                </label>
                <div className="grid gap-3">
                  {task.links?.map((link, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-500/30 transition-all">
                      <a href={link} target="_blank" rel="noreferrer" className="flex-1 text-blue-600 dark:text-blue-400 font-bold text-sm truncate">{link}</a>
                      <button onClick={() => handleDeleteLink(i)} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                  {/* INPUT TO ADD LINKS */}
                  <div className="flex gap-3 p-2 bg-slate-50 dark:bg-black/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 focus-within:border-blue-500/50 transition-colors">
                    <input 
                      type="text" 
                      placeholder="Paste new URL..." 
                      className="flex-1 bg-transparent px-5 text-sm font-bold outline-none text-slate-600 dark:text-slate-200"
                      value={editLink} 
                      onChange={(e) => setEditLink(e.target.value)}
                    />
                    <button onClick={handleAddLink} className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all shadow-lg">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: CONFIGURATION & COLORS */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-50 dark:bg-black/20 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 space-y-10">
                
                {/* PRIORITIES WITH COLORS */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Flag size={14}/> Critical Priority
                  </h4>
                  <div className="flex flex-col gap-3">
                    {['high', 'medium', 'low'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setTempTask({...tempTask, priority: p as any})}
                        className={`flex items-center justify-between px-6 py-5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          tempTask.priority === p 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xl scale-[1.05]' 
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {p}
                        {/* Dynamic color circles */}
                        <div className={`w-3 h-3 rounded-full shadow-sm ${
                          p === 'high' ? 'bg-rose-500' : 
                          p === 'medium' ? 'bg-amber-500' : 
                          'bg-emerald-500'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Tag size={14}/> Category
                  </h4>
                  <input 
                    type="text"
                    value={tempTask.category}
                    onChange={(e) => setTempTask({...tempTask, category: e.target.value})}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-2xl text-sm font-black text-slate-700 dark:text-white outline-none focus:ring-4 ring-blue-500/10"
                    placeholder="General"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Calendar size={14}/> Due Date
                  </h4>
                  <input 
                    type="date" 
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-2xl text-sm font-black text-slate-700 dark:text-white outline-none shadow-sm"
                    value={tempTask.dueDate}
                    onChange={(e) => setTempTask({...tempTask, dueDate: e.target.value})}
                  />
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button 
                onClick={handleSaveChanges}
                disabled={isSaving || !hasChanges}
                className={`w-full py-8 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] transition-all duration-300 ${
                  hasChanges 
                  ? 'bg-blue-600 text-white shadow-xl hover:bg-blue-700 hover:-translate-y-1' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="px-12 py-6 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
           <span>TaskMaster_Node: {task._id?.toString().slice(-8)}</span>
           
        </footer>
      </div>
    </div>,
    document.body
  );
}