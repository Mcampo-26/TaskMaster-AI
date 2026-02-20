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
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
    onUpdate();
  };

  const handleAdvance = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);

    const statusOrder: ITask['status'][] = ['pending', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = task.status === 'completed'
      ? 'pending'
      : statusOrder[currentIndex + 1];

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

  const style = {
    high: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    low: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  }[task.priority] || { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' };

  return (
    <>
      <div 
        onClick={() => setShowDetail(true)}
        className="group bg-white p-5 rounded-[2.2rem] mb-4 shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative cursor-pointer"
      >
        <div className="flex justify-between items-start mb-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${style.bg} ${style.text} shadow-sm border border-white`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`}></span>
            <span className="text-[10px] font-black uppercase tracking-wider">
              {task.priority}
            </span>
          </div>

          <div className="relative" ref={menuRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-[100] animate-in zoom-in duration-150 origin-top-right">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowDetail(true); 
                    setShowMenu(false); 
                  }}
                  className="flex items-center gap-3 w-full p-2.5 hover:bg-blue-50 rounded-xl text-xs font-bold text-slate-600"
                >
                  <span className="text-sm">👁️</span> Open Details
                </button>

                <div className="h-[1px] bg-slate-100 my-2 mx-2"></div>

                <button 
                  onClick={handleDelete}
                  className="flex items-center gap-3 w-full p-2.5 hover:bg-red-50 rounded-xl text-xs font-bold text-red-500"
                >
                  <span className="text-sm">🗑️</span> Delete Task
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-extrabold text-base text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
          {task.title}
        </h3>

        <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4">
          {task.description}
        </p>

        {(task.links?.length || 0) > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 mb-4 bg-slate-50 w-fit px-2 py-1 rounded-lg">
            <span>🔗</span> {task.links?.length} {task.links?.length === 1 ? 'LINK' : 'LINKS'}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
              {task.category?.charAt(0) || 'G'}
            </div>
            <span className="text-[11px] text-slate-400 font-black uppercase tracking-tighter">
              {task.category || 'General'}
            </span>
          </div>

          <button 
            onClick={handleAdvance} 
            disabled={isUpdating}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm active:scale-95
              ${task.status === 'completed'
                ? 'bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
              }`}
          >
            {isUpdating ? '...' : task.status === 'completed' ? 'Restart' : 'Advance →'}
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