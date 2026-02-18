"use client";
import { useState } from 'react';

interface ChatPanelProps {
  tasks: any[];
  onTaskUpdated: () => void;
}

export default function ChatPanel({ tasks, onTaskUpdated }: ChatPanelProps) {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
  
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg
        }),
      });
  
      const data = await res.json();
      console.log(
        "Texto Gemini:",
        data?.candidates?.[0]?.content?.parts?.[0]?.text
      );
  
      if (!res.ok) {
        throw new Error(data.error || "Error del servidor");
      }
  
      // 🔒 Protección por si text viene undefined
      const aiText = data?.text || "La IA no devolvió respuesta.";
  
      // Si algún día devolvés acciones, esto queda listo
      if (data.action === "UPDATE_TASK") {
        const updateRes = await fetch(`/api/tasks/${data.taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.update),
        });
  
        if (updateRes.ok) {
          onTaskUpdated();
        }
      } 
      else if (data.action === "BULK_UPDATE") {
        const bulkRes = await fetch('/api/tasks/bulk', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            filter: {},
            update: data.update 
          }),
        });
  
        if (bulkRes.ok) {
          onTaskUpdated();
        }
      }
  
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
  
    } catch (error) {
      console.error("Error en chat:", error);
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: "Lo siento, hubo un error de conexión." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <aside className="hidden lg:flex w-[400px] bg-slate-900/30 border-l border-slate-800/50 backdrop-blur-xl flex-col h-screen">
      <div className="p-6 border-b border-slate-800/50">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white">
          <span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>
          Asistente TaskMaster
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-xs py-10">
            Prueba decir: <br/> 
            <span className="italic">"Pon todas las tareas en prioridad Alta"</span>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-xs text-slate-500 animate-pulse pl-2">IA procesando...</div>}
      </div>

      <form onSubmit={sendMessage} className="p-6 border-t border-slate-800/50">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe aquí..." 
          className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-4 focus:border-blue-500 outline-none text-sm transition-all text-white"
        />
      </form>
    </aside>
  );
}