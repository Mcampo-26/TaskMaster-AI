import TaskCard from './components/TaskCard';
import { ITask } from '@/models/Task';

// Datos de prueba (Mock Data) basados en tu interfaz ITask
const mockTasks: ITask[] = [
  {
    _id: '1',
    title: 'Configurar conexión MongoDB',
    description: 'Establecer el Singleton de conexión y verificar las variables de entorno.',
    status: 'completed',
    priority: 'high',
    createdAt: new Date(),
    userId: 'user_1'
  },
  {
    _id: '2',
    title: 'Diseñar Dashboard Principal',
    description: 'Crear el layout de dos columnas con scroll independiente y chat de IA.',
    status: 'in-progress',
    priority: 'medium',
    createdAt: new Date(),
    userId: 'user_1'
  },
  {
    _id: '3',
    title: 'Definir Modelo de Datos',
    description: 'Crear la interfaz ITask para asegurar el tipado en toda la aplicación.',
    status: 'completed',
    priority: 'low',
    createdAt: new Date(),
    userId: 'user_1'
  },
  {
    _id: '4',
    title: 'Entrenar Agente de IA',
    description: 'Configurar los prompts iniciales para el asistente de gestión de tareas.',
    status: 'pending',
    priority: 'high',
    createdAt: new Date(),
    userId: 'user_1'
  }
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden">
      
      {/* SECCIÓN DE TAREAS */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6 md:p-12">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Mis Proyectos</h1>
            <p className="text-slate-400 font-medium">Tienes {mockTasks.length} tareas activas para hoy.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 text-white px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95">
            + Nueva Tarea
          </button>
        </header>

        {/* Grilla de Tareas dinámicas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {mockTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      </main>

      {/* PANEL DE IA (Placeholder) */}
      <aside className="hidden lg:flex w-[400px] bg-slate-900/30 border-l border-slate-800/50 backdrop-blur-xl flex-col">
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Asistente TaskMaster
          </h2>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-end">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 mb-4">
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "Hola Mauricio, he analizado tus tareas. Tienes 2 de prioridad alta que requieren atención inmediata."
            </p>
          </div>
          <input 
            type="text" 
            placeholder="Preguntale algo a la IA..." 
            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </aside>

    </div>
  );
}