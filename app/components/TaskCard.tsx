"use client";

import { ITask } from '@/models/Task';
import { useState, useRef, useEffect } from 'react';
import TaskDetailModal from './TaskDetailModal';

interface TaskCardProps {
  task: ITask;
  index: number;
  onUpdate: () => void;
}

export default function TaskCard({
  task,
  onUpdate
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
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
    if (!confirm('¿Eliminar esta tarea?')) return;
    await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
    onUpdate();
  };

  const handleAdvance = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);

    const statusOrder: ITask['status'][] = ['pending', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = task.status === 'completed' ? 'pending' : statusOrder[currentIndex + 1];

    try {
      await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Colores de prioridad mucho más suaves y desaturados
  const style = {
    high: { bg: 'bg-rose-50 dark:bg-rose-500/5', text: 'text-rose-600 dark:text-rose-400/80', dot: 'bg-rose-500' },
    medium: { bg: 'bg-amber-50 dark:bg-amber-500/5', text: 'text-amber-600 dark:text-amber-400/80', dot: 'bg-amber-500' },
    low: { bg: 'bg-emerald-50 dark:bg-emerald-500/5', text: 'text-emerald-600 dark:text-emerald-400/80', dot: 'bg-emerald-500' },
  }[task.priority] || { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="group bg-white dark:bg-[#161b22] p-5 rounded-[2rem] mb-4 shadow-sm border border-slate-200/60 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-300 relative cursor-pointer"
      >
        <div className="flex justify-between items-start mb-4">
          {/* Priority Badge Soft */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${style.bg} ${style.text} border border-transparent dark:border-white/5`}>
            <span className={`w-1 h-1 rounded-full ${style.dot} opacity-70`}></span>
            <span className="text-[9px] font-bold uppercase tracking-widest">
              {task.priority}
            </span>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 text-slate-300 dark:text-slate-700 hover:text-slate-600 dark:hover:text-slate-400 rounded-full transition-all"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1f2937] border border-slate-100 dark:border-slate-700 shadow-xl rounded-2xl p-1.5 z-[100] animate-in fade-in zoom-in duration-200">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDetail(true); setShowMenu(false); }}
                  className="flex items-center gap-3 w-full p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <span className="opacity-50">👁️</span> Detalles
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-3 w-full p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-xs font-medium text-rose-500 transition-colors"
                >
                  <span className="opacity-50">🗑️</span> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-[20px] text-slate-800 dark:text-[#B6C2CF] mb-2">
          {task.title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-[#9FADBC] leading-relaxed">
          {task.description}
        </p>

        {/* Links Badge Soft */}
        {(task.links?.length || 0) > 0 && (
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-4 bg-slate-50 dark:bg-slate-800/40 w-fit px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700/30">
            <span className="opacity-70">🔗</span> {task.links?.length} {task.links?.length === 1 ? 'LINK' : 'LINKS'}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
              {task.category?.charAt(0) || 'G'}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              {task.category || 'General'}
            </span>
          </div>

          <button
            onClick={handleAdvance}
            disabled={isUpdating}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-all active:scale-95
              ${task.status === 'completed'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                : 'bg-slate-900 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-500 shadow-sm'
              }`}
          >
            {isUpdating ? '...' : task.status === 'completed' ? 'Reiniciar' : 'Avanzar →'}
          </button>
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