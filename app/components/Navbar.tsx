"use client";
import { useState } from "react";
import { Search, Bell, Menu, X, Plus, Layout } from "lucide-react";

interface NavbarProps {
  onSearch: (value: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="h-14 bg-[#091e42] border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-[100] relative">

      {/* SECCIÓN IZQUIERDA */}
      <div className="flex items-center gap-4 z-10">
        <button 
          className="lg:hidden text-white p-1 hover:bg-white/10 rounded"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center gap-2 text-white font-bold text-xl cursor-default shrink-0">
          <div className="bg-blue-500 p-1 rounded-sm">
            <Layout className="text-white" size={18} />
          </div>
          <span className=" xs:block tracking-tight">TaskMaster</span>
        </div>
      </div>

      {/* SECCIÓN CENTRAL: Buscador Centrado */}
      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center z-0">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-blue-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Buscar en este tablero..." 
            onChange={(e) => onSearch(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-md py-1.5 pl-10 pr-4 text-sm text-white focus:bg-white focus:text-slate-900 outline-none w-[300px] lg:w-[400px] transition-all shadow-inner focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* SECCIÓN DERECHA */}
      <div className="flex items-center gap-2 z-10">
        <button className="hidden sm:flex bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-bold items-center gap-1 transition-all active:scale-95">
          <Plus size={16} /> <span className="hidden lg:inline">Crear</span>
        </button>

        <div className="flex items-center gap-1 text-white/80">
          <button className="p-2 hover:bg-white/10 rounded-full relative transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#091e42]"></span>
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/20 cursor-pointer ml-1 shadow-md hover:scale-105 transition-transform">
            MC
          </div>
        </div>
      </div>
    </nav>
  );
}