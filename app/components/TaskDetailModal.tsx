"use client";
import { ITask } from '@/models/Task';
import { useState } from 'react';
import { Save, Trash2, X, CheckCircle2, MessageSquare, Link as LinkIcon, Calendar, Flag, Clock, Plus } from 'lucide-react';

interface Props {
  task: ITask;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TaskDetailModal({ task, onClose, onUpdate }: Props) {
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

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      
      {showAlert && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-8 duration-500">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-8 py-3 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.4)] flex items-center gap-3">
            <CheckCircle2 size={20} className="animate-bounce" />
            <span className="font-black text-xs uppercase tracking-widest">Changes Synced</span>
          </div>
        </div>
      )}

      {/* MODAL CONTAINER - Ajustado para Scroll */}
      <div 
        className="bg-[#1e293b] w-full max-w-4xl max-h-[90vh] rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-slate-700/50 relative flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-10" />

        {/* ÁREA SCROLLEABLE */}
        <div className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scrollbar">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* PRIMARY COLUMN */}
            <div className="flex-1 space-y-10">
              <header className="space-y-4">
                <input 
                  value={tempTask.title}
                  onChange={(e) => setTempTask({...tempTask, title: e.target.value})}
                  className="text-4xl font-black text-white bg-transparent border-none outline-none w-full focus:ring-0 placeholder:text-slate-600 tracking-tight"
                  placeholder="Task title..."
                />
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <Clock size={12} className="text-cyan-400" />
                    Created {dateCreated}
                  </div>
                  <div className="text-[10px] font-black uppercase text-cyan-400/80 tracking-[0.2em]">
                     Status: {task.status?.replace('-', ' ')}
                  </div>
                </div>
              </header>

              <section className="space-y-4">
                <div className="flex items-center gap-3 opacity-40">
                  <MessageSquare size={16} className="text-white" />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Description</h3>
                </div>
                <textarea 
                  value={tempTask.description}
                  onChange={(e) => setTempTask({...tempTask, description: e.target.value})}
                  className="w-full bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-700/40 text-slate-300 text-sm shadow-inner outline-none focus:border-cyan-500/30 focus:ring-4 ring-cyan-500/5 transition-all resize-none min-h-[180px] leading-relaxed"
                  placeholder="Add task details or internal notes..."
                />
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 opacity-40">
                  <LinkIcon size={16} className="text-white" />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Resources</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {task.links?.map((link, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 group hover:bg-slate-800 transition-all">
                      <a href={link} target="_blank" className="flex-1 text-slate-400 font-bold text-[11px] truncate">{link}</a>
                      <button onClick={() => handleDeleteLink(i)} className="p-1 text-slate-600 hover:text-rose-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 p-2 bg-slate-950/40 rounded-2xl border border-dashed border-slate-700">
                    <input 
                      type="text" 
                      placeholder="Paste link..." 
                      className="flex-1 bg-transparent px-3 text-[11px] font-bold outline-none text-white placeholder:text-slate-600"
                      value={editLink} 
                      onChange={(e) => setEditLink(e.target.value)}
                    />
                    <button onClick={handleAddLink} className="bg-cyan-500 hover:bg-cyan-400 text-white p-2 rounded-xl transition-all shadow-lg shadow-cyan-900/20">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* SIDEBAR CONFIG */}
            <div className="w-full lg:w-72 space-y-8">
              <div className="bg-slate-900/30 p-8 rounded-[3rem] border border-slate-700/30 space-y-10">
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                     <Flag size={12}/> Priority Level
                  </h4>
                  <div className="space-y-2">
                    {['high', 'medium', 'low'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setTempTask({...tempTask, priority: p as any})}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-[10px] font-black uppercase transition-all ${
                          tempTask.priority === p 
                            ? 'bg-white text-slate-900 border-white shadow-[0_10px_25px_rgba(255,255,255,0.1)]' 
                            : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:border-slate-600'
                        }`}
                      >
                        {p}
                        <div className={`w-1.5 h-1.5 rounded-full ${p === 'high' ? 'bg-rose-500' : p === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                     <Calendar size={12}/> Due Date
                  </h4>
                  <input 
                    type="date" 
                    className="w-full bg-slate-800/40 border border-slate-700 p-4 rounded-2xl text-[11px] font-black text-white outline-none focus:border-cyan-500/40 transition-all [color-scheme:dark]"
                    value={tempTask.dueDate}
                    onChange={(e) => setTempTask({...tempTask, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button 
                  onClick={handleSaveChanges}
                  disabled={isSaving || !hasChanges}
                  className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${
                    hasChanges 
                    ? 'bg-cyan-500 text-white shadow-[0_15px_30px_rgba(6,182,212,0.2)] hover:bg-cyan-400 hover:-translate-y-1' 
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {isSaving ? "Saving..." : "Commit Changes"}
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM FOOTER - flex-shrink-0 para que no se oculte */}
        <footer className="bg-black/20 p-8 flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest border-t border-slate-700/30">
          <div className="flex items-center gap-4">
            <span className="text-cyan-500/40 tracking-normal italic">TaskMaster.OS // NODE_{task._id?.toString().slice(-8)}</span>
          </div>
          <button className="flex items-center gap-2 hover:text-rose-400 transition-colors group">
            <Trash2 size={12} className="group-hover:animate-pulse" /> Archive Entry
          </button>
        </footer>
      </div>
    </div>
  );
}