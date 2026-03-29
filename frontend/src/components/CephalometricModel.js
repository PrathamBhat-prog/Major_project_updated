import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Play, Info } from 'lucide-react';

const CephalometricBackground = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-[calc(100vh-76px)] flex items-center justify-center pointer-events-none">
      
      {/* Narrative Container */}
      <div className="max-w-4xl text-center space-y-8 pointer-events-auto px-6 animate-fade-in relative z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
          Modern Health Tools
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-4 uppercase italic">
          Cephalo<span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">AI</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-bold leading-relaxed uppercase tracking-normal">
          Smart AI for Dental X-Rays. Easy and Fast. Built for your clinical workflow.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center mt-12">
          {/* Changed to dark button for better accessibility/contrast */}
          <button 
            onClick={() => navigate("/login")} 
            className="group px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black transition-all shadow-2xl hover:bg-black hover:-translate-y-1 flex items-center justify-center gap-2 uppercase tracking-widest text-xs italic shadow-indigo-500/20"
          >
            <Play size={16} fill="currentColor" />
            Sign In Now
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={()=>navigate("/lm")} 
            className="px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md text-white rounded-2xl font-black transition-all hover:-translate-y-1 flex items-center justify-center gap-2 uppercase tracking-widest text-xs italic"
          >
            <Info size={16} />
            Learn More
          </button>
        </div>
      </div>

      {/* Grid Capability Overlays - Simple English */}
      <div className="absolute bottom-20 w-full px-8 md:px-24 grid grid-cols-1 md:grid-cols-3 gap-10 hidden md:grid z-10">
        {/* <CapabilityCard 
          title="High Accuracy" 
          desc="AI helps find landmarks on X-rays with very high precision."
        /> */}
        {/* <CapabilityCard 
          title="Fast Results" 
          desc="Get your analysis reports in less than 3 seconds per patient."
        /> */}
        {/* <CapabilityCard 
          title="Doctor Trusted" 
          desc="Standard medical rules ensure your reports are safe and correct."
        /> */}
      </div>
    </div>
  );
};

function CapabilityCard({ title, desc }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] hover:border-white/10 transition-all pointer-events-auto backdrop-blur-sm">
      <h3 className="text-white font-black text-xs uppercase tracking-widest mb-3 opacity-40 group-hover:opacity-100 transition-opacity italic">{title}</h3>
      <p className="text-slate-500 text-sm font-bold leading-relaxed group-hover:text-slate-400 transition-colors uppercase tracking-tight">{desc}</p>
    </div>
  );
}

export default CephalometricBackground;