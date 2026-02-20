"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";

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

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Navegador no compatible");
    
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
        body: JSON.stringify({ message: userMsg, tasks }),
      });

      const data = await res.json();
      const aiText = data?.text || "Sin respuesta";

      if (isSpeechEnabled && typeof window !== "undefined") {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(aiText);
        ut.lang = "es-ES";
        window.speechSynthesis.speak(ut);
      }

      setMessages(prev => [...prev, { role: "ai", text: aiText }]);
      if (data.updated) onTaskUpdated();
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Error de conexión." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1d2125]">
      {/* Header interno */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          <h2 className="text-xs font-bold text-gray-400 uppercase">Asistente IA</h2>
        </div>
        <button 
          onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
          className={`p-1.5 rounded transition-colors ${isSpeechEnabled ? "text-blue-400" : "text-gray-600"}`}
        >
          {isSpeechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-600 text-xs italic mt-10">Escribe o dicta algo para comenzar...</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              m.role === "user" ? "bg-blue-600 text-white" : "bg-[#2c333a] text-gray-200 border border-white/5"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-[10px] text-blue-400 animate-pulse font-bold uppercase">IA Pensando...</div>}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-[#22272b] border-t border-white/10">
  <div className="flex items-center gap-2">
    <div className="relative flex-1 group">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe o dicta un mensaje..."
        className="w-full bg-[#1d2125] border border-white/20 rounded-full pl-5 pr-12 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
      />
      
      {/* Botón de Micrófono mejor posicionado */}
      <button
        type="button"
        onClick={startListening}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
          isListening 
          ? "bg-red-500 text-white animate-pulse" 
          : "text-gray-400 hover:text-blue-400 hover:bg-white/5"
        }`}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>
    </div>

    {/* Botón de Enviar circular */}
    <button 
      type="submit" 
      disabled={!input.trim() || isTyping}
      className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90 shadow-lg shadow-blue-900/20"
    >
      <Send size={18} />
    </button>
  </div>
  
  <p className="text-[10px] text-center mt-3 text-gray-500 font-medium tracking-wide uppercase opacity-50">
    IA Integrada • TaskMaster
  </p>
</form>
    </div>
  );
}