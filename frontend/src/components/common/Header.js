// filepath: src/components/common/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header(){
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo Section */}
        <div 
          onClick={() => nav("/")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <span className="text-white font-bold text-xl tracking-tight">C</span>
          </div>
          <div>
            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-indigo-300 tracking-tight">
              CephaloAI
            </div>
            <div className="text-xs text-cyan-100/60 font-medium tracking-wider uppercase">
              Orthodontic Intelligence
            </div>
          </div>
        </div>

        {/* Right Section / Auth */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => nav("/lm")}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Capabilities
          </button>
          
          <button
            onClick={() => nav("/login")}
            className="relative overflow-hidden group px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            <span className="relative z-10 text-sm font-semibold text-white tracking-wide">
              Sign In
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/40 to-indigo-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

      </div>
    </header>
  );
}