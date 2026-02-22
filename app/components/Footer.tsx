"use client";
import { Twitter, Github, Instagram, Zap, Shield, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-[#08080a] border-t border-slate-200 dark:border-slate-800/60 py-8 transition-colors duration-500 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Contenedor Principal */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* 1. BRAND & SLOGAN (Izquierda) */}
          <div className="flex flex-col items-center lg:items-start gap-2">
            <div className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Zap size={16} className="text-white fill-white" />
              </div>
              <span className="font-black text-lg uppercase tracking-tighter text-slate-800 dark:text-white">
                Task Master <span className="text-blue-600">AI</span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">
              Intelligent workflow for modern teams.
            </p>
          </div>

          {/* 2. LINKS & STATUS (Centro) */}
          <div className="flex flex-col items-center gap-4">
            <nav>
              <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Product</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Privacy</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Docs</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors italic opacity-40">v2.4.0</li>
              </ul>
            </nav>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                 Argentina — Systems Operational
               </span>
            </div>
          </div>

          {/* 3. SOCIAL & COPYRIGHT (Derecha) */}
          <div className="flex flex-col items-center lg:items-end gap-3">
            <div className="flex gap-4">
              {[
                { icon: <Twitter size={18} />, hover: "hover:text-blue-400" },
                { icon: <Github size={18} />, hover: "hover:text-slate-900 dark:hover:text-white" },
                { icon: <Instagram size={18} />, hover: "hover:text-pink-500" }
              ].map((social, i) => (
                <a key={i} href="#" className={`text-slate-400 transition-all duration-300 hover:-translate-y-1 ${social.hover}`}>
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              © {currentYear} TaskMaster AI Inc.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}