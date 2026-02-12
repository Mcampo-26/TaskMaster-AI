import { ITask } from '@/models/Task';

export default function TaskCard({ task }: { task: ITask }) {
  // Definimos colores según la prioridad
  const priorityColors = {
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:border-blue-500/50 transition-all group cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className="text-xs text-slate-500 font-medium">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <h3 className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors mb-1">
        {task.title}
      </h3>
      
      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
        <span className="text-[11px] text-slate-500 italic">Estado: {task.status}</span>
        <button className="text-blue-400 text-xs hover:underline">Ver más →</button>
      </div>
    </div>
  );
}