import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Play, Award, CheckCircle, Shield } from 'lucide-react';

const CephalometricBackground = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-[calc(100vh-76px)] flex items-center justify-center bg-transparent">
      
      {/* Narrative Container */}
      <div className="max-w-7xl w-full px-8 flex flex-col lg:flex-row items-center gap-16 relative z-10 animate-fade-in">
        
        {/* Left Content */}
        <div className="flex-1 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-cyan-400 backdrop-blur-md">
            <Award size={14} /> Registered Medical Device Class II
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight leading-[1.05]">
         AI for           <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Cephalometric</span> <br/>
            Intelligence.
          </h1>
          
          <p className="text-xl text-slate-400 max-w-xl font-medium leading-relaxed">
            Automate orthodontic landmarks with clinical precision. Reduce analysis time by 60% with our peer-reviewed neural engine.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <button 
              onClick={() => navigate("/login")} 
              className="px-10 py-5 bg-cyan-600 text-white rounded-xl font-bold transition-all hover:bg-white hover:text-cyan-900 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm shadow-2xl shadow-cyan-500/20 active:scale-95"
            >
              <Play size={18} fill="currentColor" />
              Sign In to Portal
              <ChevronRight size={18} />
            </button>
            <button 
              onClick={() => navigate("/lm")} 
              className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-xl font-bold transition-all hover:bg-white/10 flex items-center justify-center gap-2 text-sm backdrop-blur-md active:scale-95"
            >
              Explore Capabilities
            </button>
          </div>

          <div className="flex items-center gap-12 pt-8 border-t border-white/5">
             <div className="space-y-1">
                <div className="text-3xl font-bold text-white">2.4<span className="text-sm font-medium text-slate-400 ml-1">sec</span></div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Processing</div>
             </div>
             <div className="w-px h-12 bg-white/10"></div>
             <div className="space-y-1">
                <div className="text-3xl font-bold text-white">11 / 19</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Benchmarks</div>
             </div>
          </div>
        </div>

        {/* Right Visual (RESTORED) */}
        <div className="flex-1 w-full max-w-xl hidden lg:block animate-float">
           <div className="relative bg-white/5 p-4 rounded-[3rem] border border-white/10 shadow-3xl backdrop-blur-sm group">
              <img 
                src="/images/skull_medical_analysis.png" 
                alt="AI Cephalometric Analysis" 
                className="w-full h-auto rounded-[2.5rem] grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" 
              />
              <div className="absolute top-8 right-8">
                 <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4 animate-bounce-slow">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-[#020408]">
                       <CheckCircle size={20} />
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</div>
                       <div className="text-xs font-bold text-white">Neural Engine Active</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CephalometricBackground;