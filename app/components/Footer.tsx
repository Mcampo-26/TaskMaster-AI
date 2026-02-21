"use client";
import { Twitter, Facebook, Instagram, Zap, Shield, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-[#0a0a0c] border-t border-slate-200 dark:border-slate-800/60 py-6 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Lado Izquierdo: Brand & Copyright reducido */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap size={12} className="text-white fill-white" />
              </div>
              <span className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
                Task Master <span className="text-blue-600">AI</span>
              </span>
            </div>
            <p className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-6">
              © {currentYear} — Argentina
            </p>
          </div>

          {/* Centro: Links rápidos en horizontal */}
          <nav className="flex items-center gap-6">
            <ul className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Dashboard</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Privacy</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Support</li>
            </ul>
          </nav>

          {/* Lado Derecho: Social & Status compacto */}
          <div className="flex items-center gap-6">
            <div className="flex gap-3">
              <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors">
                <Twitter size={14} />
              </a>
              <a href="#" className="text-slate-400 hover:text-pink-500 transition-colors">
                <Instagram size={14} />
              </a>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 dark:text-slate-600">
                v2.4.0
              </span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}