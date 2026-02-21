"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic, MicOff, Volume2, VolumeX, Activity, Trash2, Edit3, MoveRight, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false); 
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser not compatible with voice recognition");
    
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
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
          success = await ai.aiCreateTask(data.payload);
          break;
        case "UPDATE_STATUS":
          success = await ai.aiUpdateTask(data.payload.id, { status: data.payload.status });
          break;
        case "DELETE_TASK":
          success = await ai.aiDeleteTask(data.payload.id);
          break;
        case "EDIT_TASK":
          if (data.payload.id) {
            const { id, ...updates } = data.payload;
            success = await ai.aiUpdateTask(id, updates);
          }
          break;
        case "BULK_UPDATE":
          success = await ai.aiUpdateBulkTasks(data.payload.tasks, data.payload.updates);
          break;
      }
      if (success) onTaskUpdated(); 
    } catch (err) {
      console.error("Error executing AI action:", err);
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
      setMessages(prev => [...prev, { role: "ai", text: data.text || "Done." }]);
      if (isSpeechEnabled && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.text);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: "Connection error." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`
      transition-all duration-500 ease-in-out bg-white/95 dark:bg-[#1d2125]/95 
      backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden
      
      /* MOBILE */
      fixed bottom-[150px] left-4 right-4 z-[999] rounded-3xl
      
      /* DESKTOP (md) */
      md:relative md:bottom-0 md:left-auto md:right-auto md:z-[50] md:rounded-[2rem]
      
      /* CAMBIO CLAVE: Usamos max-height en lugar de height fija para eliminar el vacío */
      ${isOpen ? "max-h-[500px] h-auto w-auto md:w-[450px]" : "h-[70px] w-auto md:w-[280px]"}
    `}>
      {/* Header */}
      <div 
        className="p-4 bg-slate-50/80 dark:bg-[#161a1d]/80 flex items-center justify-between border-b border-slate-200 dark:border-white/5 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">AI Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500 uppercase">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsSpeechEnabled(!isSpeechEnabled); }}
            className={`p-2 rounded-full transition-colors ${isSpeechEnabled ? "text-blue-600 bg-blue-100 dark:bg-blue-400/10" : "text-slate-400 bg-slate-200 dark:bg-white/5"}`}
          >
            {isSpeechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <div className="text-slate-400">
            {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>
        </div>
      </div>

      {/* Cuerpo: Eliminamos paddings innecesarios abajo */}
      <div className={`flex flex-col transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {/* Área de Mensajes: max-h dinámico para que empuje el form hacia arriba */}
        <div 
          ref={scrollRef} 
          className="overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#1d2125] custom-scrollbar max-h-[350px]"
        >
          {messages.length === 0 && (
            <div className="py-10 flex flex-col items-center justify-center opacity-30 text-center space-y-2">
              <Activity size={40} className="text-blue-600" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-white">Ready</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${m.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-100 dark:bg-[#2c333a] dark:text-gray-200 rounded-bl-none border border-slate-200 dark:border-white/5"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 pl-2">
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
        </div>

        {/* Formulario: Pegado al final del contenido */}
        <form onSubmit={sendMessage} className="p-4 bg-slate-50/50 dark:bg-[#22272b]/50 border-t border-slate-200 dark:border-white/10 mt-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Command..."
                className="w-full bg-white dark:bg-[#1d2125] border border-slate-300 dark:border-white/10 rounded-full pl-5 pr-12 py-2.5 text-xs outline-none"
              />
              <button type="button" onClick={startListening} className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-400"}`}>
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
            <button type="submit" className="p-2.5 bg-blue-600 text-white rounded-full">
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}