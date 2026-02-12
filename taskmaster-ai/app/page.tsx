import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 p-8">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            TaskMaster AI
          </h1>
          <p className="text-slate-400 mt-2">Gestioná tus tareas con inteligencia.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-all">
          + Nueva Tarea
        </button>
      </header>

      {/* Grid de Tareas (Placeholder) */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl hover:border-blue-500/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold px-2 py-1 bg-blue-500/10 text-blue-400 rounded">Pendiente</span>
            <span className="text-xs text-slate-500">Hoy</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Configurar MongoDB</h3>
          <p className="text-slate-400 text-sm">Terminar la conexión de la base de datos y el modelo.</p>
        </div>
        
        {/* Aquí irán más tareas dinámicas luego */}
      </section>
    </main>
  );
}