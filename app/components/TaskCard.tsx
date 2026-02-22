"use client";

import { ITask } from '@/models/Task';
import { useState, useRef, useEffect } from 'react';
import TaskDetailModal from './TaskDetailModal';
import { MoreHorizontal, MessageSquare, Link2, Tag, Calendar, Clock } from 'lucide-react';
import PrioritySelector from './PrioritySelector';

interface TaskCardProps {
  task: ITask;
  index: number;
  onUpdate: () => void;
}

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
    onUpdate();
  };

  // SISTEMA DE COLORES PREMIUM (Igual al Task Detail)
  const priorityStyles = {
    high: {
      dot: 'bg-rose-500',
      lightBg: 'bg-rose-50 dark:bg-rose-500/10',
      text: 'text-rose-500',
      border: 'border-rose-200 dark:border-rose-500/30',
      shadow: 'shadow-rose-500/20'
    },
    medium: {
      dot: 'bg-amber-500',
      lightBg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-500',
      border: 'border-amber-200 dark:border-amber-500/30',
      shadow: 'shadow-amber-500/20'
    },
    low: {
      dot: 'bg-emerald-500',
      lightBg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      shadow: 'shadow-emerald-500/20'
    }
  }[task.priority as 'high' | 'medium' | 'low'] || {
    dot: 'bg-slate-500',
    lightBg: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-200',
    shadow: 'shadow-slate-500/10'
  };

  const formattedDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="group bg-white dark:bg-[#0b1120] rounded-[2rem] mb-4 shadow-sm border border-slate-200 dark:border-slate-800/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 relative cursor-pointer overflow-hidden flex flex-col"
      >
        {/* TASK COVER */}
        {task.imageUrl && (
          <div className="w-full aspect-[21/9] overflow-hidden relative">
            <img 
              src={task.imageUrl} 
              alt="" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            {/* Priority Badge Premium */}
            <PrioritySelector 
  selectedPriority={task.priority} 
  isReadOnly={true} 
/>

            {/* Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <MoreHorizontal size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDetail(true); setShowMenu(false); }}
                    className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-xs font-bold uppercase tracking-tighter text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-3 w-full p-3 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-xs font-bold uppercase tracking-tighter text-rose-500 transition-colors"
                  >
                    Delete Task
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Título */}
          <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight tracking-tighter mb-2 group-hover:text-blue-500 transition-colors">
            {task.title}
          </h3>

          {/* Descripción y Fecha */}
          <div className="space-y-3 mb-6">
            {task.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                {task.description}
              </p>
            )}
            
            {formattedDate && (
              <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest">
                <Calendar size={12} />
                <span>Due {formattedDate}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-auto pt-5 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-4 text-slate-400">
              {task.description && (
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-blue-500/50" />
                  <span className="text-[10px] font-bold">Detail</span>
                </div>
              )}
              {(task.links?.length || 0) > 0 && (
                <div className="flex items-center gap-1.5 text-blue-500">
                  <Link2 size={14} />
                  <span className="text-[11px] font-black">{task.links?.length}</span>
                </div>
              )}
            </div>

            {/* Category Badge */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform group-hover:-translate-y-1">
              <Tag size={12} className="text-blue-500" />
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest">
                {task.category || 'General'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showDetail && (
        <TaskDetailModal
          task={task}
          onClose={() => setShowDetail(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}