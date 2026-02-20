"use client";
import { useState } from "react";
import { Search, Bell, Menu, X, Plus, Layout } from "lucide-react";

interface NavbarProps {
  onSearch: (value: string) => void;
  onOpenForm: () => void; 
}

export default function Navbar({ onSearch, onOpenForm }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="h-14 bg-[#091e42] border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-[100] relative">

      {/* LEFT SECTION */}
      <div className="flex items-center gap-4 z-10">
        <button 
          className="lg:hidden text-white p-1 hover:bg-white/10 rounded-md transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center gap-2 text-white font-black text-xl cursor-default shrink-0">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-900/20">
            <Layout className="text-white" size={18} />
          </div>
          <span className="xs:block tracking-tighter uppercase text-sm lg:text-lg">TaskMaster</span>
        </div>
      </div>

      {/* CENTER SECTION: Centered Search */}
      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center z-0">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Search this board..." 
            onChange={(e) => onSearch(e.target.value)}
            className="bg-white/10 border border-white/10 rounded-xl py-1.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/30 focus:bg-white focus:text-slate-900 outline-none w-[300px] lg:w-[450px] transition-all shadow-inner focus:ring-4 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2 z-10">
        <button 
          onClick={onOpenForm}
          className="hidden sm:flex bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/40"
        >
          <Plus size={14} /> 
          <span className="hidden lg:inline">Create</span>
        </button>

        <div className="flex items-center gap-1 text-white/80">
          <button className="p-2 hover:bg-white/10 rounded-full relative transition-colors group">
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#091e42]"></span>
          </button>
          
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-full flex items-center justify-center text-[10px] font-black text-white border border-white/20 cursor-pointer ml-1 shadow-md hover:scale-110 transition-transform">
            JD
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-14 left-0 w-full bg-[#091e42] border-b border-white/10 p-4 lg:hidden animate-in slide-in-from-top duration-300 shadow-2xl">
           <button 
            onClick={() => { onOpenForm(); setIsMobileMenuOpen(false); }}
            className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
           >
             <Plus size={18} /> Create New Task
           </button>
        </div>
      )}
    </nav>
  );
}