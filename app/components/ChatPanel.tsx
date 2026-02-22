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
        case "CREATE_TASK": success = await ai.aiCreateTask(data.payload); break;
        case "UPDATE_STATUS": success = await ai.aiUpdateTask(data.payload.id, { status: data.payload.status }); break;
        case "DELETE_TASK": success = await ai.aiDeleteTask(data.payload.id); break;
        case "EDIT_TASK":
          if (data.payload.id) {
            const { id, ...updates } = data.payload;
            success = await ai.aiUpdateTask(id, updates);
          }
          break;
        case "BULK_UPDATE": success = await ai.aiUpdateBulkTasks(data.payload.tasks, data.payload.updates); break;
      }
      if (success) onTaskUpdated(); 
    } catch (err) { console.error("Error executing AI action:", err); }
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
      if (data.action && data.action !== "NONE") await executeAiAction(data);
      setMessages(prev => [...prev, { role: "ai", text: data.text || "Done." }]);
      if (isSpeechEnabled && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.text);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: "Connection error." }]);
    } finally { setIsTyping(false); }
  };

  return (
    /* CONTENEDOR PADRE: En desktop es un item relativo del navbar */
    <div className="relative md:static lg:relative flex items-center">
      
      {/* BOTÓN INTEGRADO AL NAVBAR */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 h-9 rounded-xl transition-all border 
          ${isOpen 
            ? "bg-white/20 border-white/20 text-white" 
            : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
      >
        <Sparkles size={14} className={isOpen ? "text-blue-400" : "text-blue-400/70"} />
        <span className="text-[10px] font-black uppercase tracking-tight hidden sm:block">AI Assistant</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* PANEL DESPLEGABLE (DROPDOWN) */}
      <div className={`
        transition-all duration-300 ease-in-out bg-white dark:bg-[#1d2125] 
        border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden
        
        /* MOBILE: Flotante fijo */
        fixed bottom-24 left-4 right-4 z-[9999] rounded-3xl
        
        /* DESKTOP: Dropdown absoluto que "cae" del botón */
        md:absolute md:bottom-auto md:top-11 md:right-0 md:left-auto
        md:w-[380px] md:rounded-2xl
        
        ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}>
        <div className="flex flex-col h-[450px]">
          {/* Header del Panel (Solo título y controles) */}
          <div className="p-4 bg-slate-50 dark:bg-[#161a1d] flex items-center justify-between border-b dark:border-white/5">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase text-slate-500">Live AI</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsSpeechEnabled(!isSpeechEnabled); }}
              className={`p-1.5 rounded-lg ${isSpeechEnabled ? "bg-blue-500/10 text-blue-500" : "text-slate-400"}`}
            >
              {isSpeechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#1d2125] custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                <Sparkles size={32} className="mb-2" />
                <p className="text-[10px] font-bold uppercase">Ask me to create or move tasks</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${m.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-100 dark:bg-[#2c333a] dark:text-gray-200 rounded-bl-none border dark:border-white/5"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] text-blue-500 animate-pulse font-bold pl-2">AI is working...</div>}
          </div>

          {/* Formulario */}
          <form onSubmit={sendMessage} className="p-4 bg-slate-50 dark:bg-[#22272b] border-t dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a command..."
                  className="w-full bg-white dark:bg-[#1d2125] border dark:border-white/10 rounded-full pl-5 pr-12 py-2.5 text-xs outline-none focus:border-blue-500"
                />
                <button type="button" onClick={startListening} className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-400"}`}>
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>
              <button type="submit" className="p-2.5 bg-blue-600 text-white rounded-full"><Send size={16} /></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}