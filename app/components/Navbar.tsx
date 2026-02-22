"use client";
import { useState } from "react";
import { Search, Bell, Menu, X, Plus, Layout } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ChatPanel from "./ChatPanel";

interface NavbarProps {
  onSearch: (value: string) => void;
  onOpenForm: () => void;
  tasks: any[];
  onTaskUpdated: () => void;
}

export default function Navbar({ onSearch, onOpenForm, tasks, onTaskUpdated }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="h-14 bg-[#091e42] dark:bg-[#020617] border-b border-white/10 dark:border-slate-800/50 flex items-center justify-between px-4 shrink-0 z-[100] relative transition-colors duration-300 gap-4">

      {/* LEFT SECTION: Logo y Menu */}
      <div className="flex items-center gap-4 shrink-0 z-10">
        <button
          className="lg:hidden text-white p-1 hover:bg-white/10 rounded-md transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center gap-2 text-white font-black text-xl cursor-default">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-900/20 text-white">
            <Layout size={18} />
          </div>
          <span className="hidden xs:block tracking-tighter uppercase text-sm lg:text-lg">TaskMaster</span>
        </div>
      </div>

      {/* CENTER SECTION: Search (Ahora es flexible para no superponerse) */}
      <div className="hidden md:flex flex-1 justify-center max-w-[600px] z-10">
        <div className="relative group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Search this board..."
            onChange={(e) => onSearch(e.target.value)}
            className="bg-white/10 dark:bg-slate-900/50 border border-white/10 dark:border-slate-700 rounded-xl py-1.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/30 focus:bg-white focus:text-slate-900 outline-none w-full transition-all shadow-inner focus:ring-4 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* RIGHT SECTION: Acciones y Chat */}
      <div className="flex items-center gap-2 shrink-0 z-10">
        <div className="hidden sm:block mr-1">
          <ThemeToggle />
        </div>

        <button
          onClick={onOpenForm}
          className="hidden sm:flex bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/40"
        >
          <Plus size={14} />
          <span className="hidden lg:inline">Create</span>
        </button>

        <div className="flex items-center gap-1 text-white/80">
          <button className="p-2 hover:bg-white/10 rounded-full relative transition-colors group text-white">
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#091e42] dark:border-[#020617]"></span>
          </button>

          {/* CHAT PANEL: Aquí se integra en Desktop */}
          <div className="hidden md:block">
            <ChatPanel tasks={tasks} onTaskUpdated={onTaskUpdated} />
          </div>

          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-full flex items-center justify-center text-[10px] font-black text-white border border-white/20 cursor-pointer ml-1 shadow-md hover:scale-110 transition-transform">
            JD
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-14 left-0 w-full bg-[#091e42] dark:bg-[#020617] border-b border-white/10 dark:border-slate-800 p-4 lg:hidden animate-in slide-in-from-top duration-300 shadow-2xl z-[101]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Theme</span>
              <ThemeToggle />
            </div>
            <button
              onClick={() => { onOpenForm(); setIsMobileMenuOpen(false); }}
              className="w-full bg-blue-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus size={18} /> Create New Task
            </button>
          </div>
        </div>
      )}

      {/* CHAT PANEL: Para Mobile (Flotante) */}
      <div className="md:hidden">
        <ChatPanel tasks={tasks} onTaskUpdated={onTaskUpdated} />
      </div>

    </nav>
  );
}