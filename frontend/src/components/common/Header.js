// filepath: src/components/common/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";

export default function Header() {
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo Section */}
        <div 
          onClick={() => nav("/")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600 shadow-md group-hover:bg-indigo-700 transition-colors">
            <Activity className="text-white" size={20} strokeWidth={3} />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight leading-none mb-0.5">
              Cephalo<span className="text-indigo-400">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-[0.1em] uppercase">
              Clinical Orthodontics
            </div>
          </div>
        </div>

        {/* Right Section / Auth */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => nav("/lm")}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Features & Precision
          </button>
          
          <button
            onClick={() => nav("/login")}
            className="px-6 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all duration-300 text-sm font-bold backdrop-blur-sm active:scale-95"
          >
            Sign In
          </button>
        </div>

      </div>
    </header>
  );
}