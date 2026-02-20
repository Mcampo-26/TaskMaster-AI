"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic, MicOff, Volume2, VolumeX, Activity, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isMinimized, setIsMinimized] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

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

  const executeAiAction = async (data: any) => {
    let success = false;
    try {
      switch (data.action) {
        case "CREATE_TASK":
          success = await ai.aiCreateTask(data.payload.title);
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
      }
      if (success) onTaskUpdated();
    } catch (err) {
      console.error("Error ejecutando acción de IA:", err);
    }
  };

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

      if (data.action && data.action !== "NONE") {
        await executeAiAction(data);
      }

      setMessages(prev => [...prev, { role: "ai", text: data.text || "Hecho." }]);

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
    <div className={`flex flex-col bg-[#1d2125] border border-white/10 shadow-[0_-20px_80px_rgba(0,0,0,0.6)] rounded-t-[2.5rem] transition-all duration-500 ease-in-out ${isMinimized ? 'h-16' : 'h-[500px] md:h-[600px]'} w-full`}>
      
      {/* HEADER */}
      <div 
        className="p-5 bg-[#161a1d] flex items-center justify-between border-b border-white/5 cursor-pointer rounded-t-[2.5rem]"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Asistente AI</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Sistema Listo</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsSpeechEnabled(!isSpeechEnabled); }}
            className={`p-2 rounded-full transition-colors ${isSpeechEnabled ? "text-blue-400 bg-blue-400/10" : "text-gray-500"}`}
          >
            {isSpeechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          {isMinimized ? <ChevronUp size={20} className="text-white" /> : <ChevronDown size={20} className="text-white" />}
        </div>
      </div>

      {!isMinimized && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#1d2125]">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                <Activity size={40} className="text-blue-400" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-loose italic">
                  "Mueve la tarea X a In Progress"<br/>"Actualiza la fecha de entrega"
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-xs font-medium leading-relaxed shadow-sm ${
                  m.role === "user" 
                  ? "bg-blue-600 text-white rounded-br-none shadow-md" 
                  : "bg-[#2c333a] text-gray-200 rounded-bl-none border border-white/5"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2 text-blue-400 pl-2">
                 <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                 <span className="text-[9px] font-black uppercase tracking-widest ml-2">Procesando</span>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-5 bg-[#22272b] border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe o dicta una orden..."
                  className="w-full bg-[#1d2125] border border-white/10 rounded-[1.2rem] pl-5 pr-12 py-4 text-xs text-white focus:ring-2 focus:ring-blue-500/40 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={startListening}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                    isListening ? "bg-red-500 text-white animate-pulse" : "text-gray-500 hover:text-blue-400"
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-20 shadow-lg active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}