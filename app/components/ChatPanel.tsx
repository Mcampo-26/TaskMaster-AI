"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic, MicOff, Volume2, VolumeX, Activity, Trash2, Edit3, MoveRight } from "lucide-react";
import * as ai from "@/lib/aiActions";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface ChatPanelProps {
  tasks: any[];
  onTaskUpdated: () => void;
}

export default function ChatPanel({ tasks, onTaskUpdated }: ChatPanelProps) {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // --- RECONOCIMIENTO DE VOZ ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Navegador no compatible con voz");
    
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  // --- LÓGICA DE EJECUCIÓN DE COMANDOS ---
  const executeAiAction = async (data: any) => {
    let success = false;
    console.log("⚙️ Ejecutando acción:", data.action, data.payload);

    try {
      switch (data.action) {
        case "CREATE_TASK":
          success = await ai.aiCreateTask(data.payload);
          break;
        case "UPDATE_STATUS":
          success = await ai.aiUpdateTask(data.payload.id, { status: data.payload.status });
          break;
        case "DELETE_TASK":
          success = await ai.aiDeleteTask(data.payload.id);
          break;
        case "EDIT_TASK":
          success = await ai.aiUpdateTask(data.payload.id, data.payload.updates);
          break;
        case "BULK_UPDATE":
          success = await ai.aiUpdateBulkTasks(data.payload.tasks, data.payload.updates);
          break;
        default:
          console.log("No se reconoció ninguna acción técnica.");
      }

      if (success) {
        onTaskUpdated(); // Refresca el Kanban Dashboard
      }
    } catch (err) {
      console.error("Error ejecutando acción de IA:", err);
    }
  };

  // --- ENVÍO DE MENSAJE ---
  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();
      console.log("🤖 IA Data:", data);

      // Ejecutamos la acción técnica si existe
      if (data.action && data.action !== "NONE") {
        await executeAiAction(data);
      }

      // Respuesta de texto de la IA
      setMessages(prev => [...prev, { role: "ai", text: data.text || "Hecho." }]);

      // Síntesis de voz (opcional)
      if (isSpeechEnabled && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.text);
        utterance.lang = "es-ES";
        window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: "Error de conexión con el servidor." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1d2125] border-l border-white/10 shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-[#161a1d] flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Asistente AI</h2>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-400">Sistema Listo</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
          className={`p-2 rounded-full transition-colors ${isSpeechEnabled ? "text-blue-400 bg-blue-400/10" : "text-gray-500 bg-white/5"}`}
        >
          {isSpeechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1d2125] custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-2">
            <Activity size={40} className="text-blue-400" />
            <p className="text-xs">"Mueve la tarea X a Listo"<br/>"Borra la tarea Y"</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              m.role === "user" 
              ? "bg-blue-600 text-white rounded-br-none shadow-lg" 
              : "bg-[#2c333a] text-gray-200 rounded-bl-none border border-white/5"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-blue-400 pl-2">
             <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
             <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
             <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
             <span className="text-[10px] font-bold uppercase tracking-widest ml-1">Procesando</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-[#22272b] border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe o dicta una orden..."
              className="w-full bg-[#1d2125] border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none transition-all"
            />
            <button
              type="button"
              onClick={startListening}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                isListening ? "bg-red-500 text-white animate-pulse" : "text-gray-500 hover:text-blue-400"
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all disabled:opacity-20 shadow-lg"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}