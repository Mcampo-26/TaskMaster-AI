export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden">
      
      {/* SECCIÓN 1: LISTA DE TAREAS (Ocupa el 60-70%) */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold italic tracking-tight">Mis Tareas</h1>
            <p className="text-slate-400">Organiza tu día con TaskMaster AI</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl font-semibold transition-all">
            + Nueva
          </button>
        </header>

        {/* Aquí mapearemos las tareas luego */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-2xl">
            <h3 className="font-medium text-blue-300">Ejemplo: Terminar el Dashboard</h3>
            <p className="text-sm text-slate-500">Maquetar la interfaz dividida.</p>
          </div>
        </div>
      </main>

      {/* SECCIÓN 2: CHAT DE IA (Sidebar derecha - Ocupa el 30-40%) */}
      <aside className="hidden lg:flex w-96 bg-slate-900/50 border-l border-slate-800 flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Asistente IA
          </h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Mensajes del chat */}
          <p className="text-sm text-slate-400 italic">"Hola Mauricio, ¿en qué puedo ayudarte hoy?"</p>
        </div>
        <div className="p-4 bg-slate-900">
          <input 
            type="text" 
            placeholder="Preguntale a la IA..." 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
      </aside>

    </div>
  );
}