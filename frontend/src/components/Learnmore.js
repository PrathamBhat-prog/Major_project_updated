import React from "react";
import { 
  Cpu, ShieldCheck, Zap, BarChart3, 
  ArrowRight, CheckCircle2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Learnmore() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative py-20 px-6 max-w-7xl mx-auto space-y-32 animate-fade-in text-white">
      
      {/* Narrative Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
          How it works
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none uppercase italic">
          High Accuracy <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-600">AI Results</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-bold leading-relaxed uppercase tracking-tight">
          CephaloAI uses smart technology to automatically find points on dental X-rays. It saves time and helps doctors work better.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Cpu className="text-indigo-500" />}
          title="Smart AI"
          desc="Our computer brain has studied thousands of X-rays to learn exactly where to look."
        />
        <FeatureCard 
          icon={<Zap className="text-indigo-500" />}
          title="Fast Help"
          desc="Calculate all dental angles and numbers in just a few seconds. No more slow drawing."
        />
        <FeatureCard 
          icon={<ShieldCheck className="text-indigo-500" />}
          title="Private Data"
          desc="We keep all your patient info safe and locked with the best digital security."
        />
      </div>

      {/* Technical Process Section */}
      <div className="space-y-16 py-20 border-t border-white/5">
         <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
               <h2 className="text-4xl font-black uppercase tracking-tighter italic">Easy 3-Step <br/> Process</h2>
               <p className="text-slate-500 font-bold leading-relaxed uppercase text-sm">
                  Our app works in three easy steps to give you the best results:
               </p>
               <ul className="space-y-4">
                  <WorkflowStep text="Upload the X-ray image from your computer." />
                  <WorkflowStep text="The AI finds over 50 important points for you." />
                  <WorkflowStep text="Review the results and save your report." />
               </ul>
            </div>
            <div className="flex-1 w-full p-8 rounded-[3.5rem] bg-white/5 border border-white/10 relative overflow-hidden group shadow-inner">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <BarChart3 size={200} className="mx-auto text-white/5 group-hover:text-white/10 transition-colors" />
            </div>
         </div>
      </div>

      {/* CTA Footer */}
      <div className="rounded-[4rem] p-12 md:p-24 bg-white/5 border border-white/10 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-none uppercase italic">Ready to use <br/> Smart AI?</h2>
        <button 
          onClick={() => navigate("/login")}
          className="px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-black transition-all flex items-center justify-center gap-3 mx-auto text-lg shadow-2xl shadow-indigo-500/20 uppercase tracking-widest italic"
        >
          Get Started Now
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-10 rounded-[3rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all group shadow-inner">
      <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 uppercase tracking-tight italic">{title}</h3>
      <p className="text-slate-500 font-bold leading-relaxed group-hover:text-slate-400 transition-colors uppercase text-sm">{desc}</p>
    </div>
  );
}

function WorkflowStep({ text }) {
  return (
    <li className="flex items-center gap-4 text-slate-400 font-bold group">
      <div className="w-8 h-8 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
        <CheckCircle2 size={16} fill="currentColor" />
      </div>
      <span className="uppercase tracking-tight text-sm">{text}</span>
    </li>
  );
}
