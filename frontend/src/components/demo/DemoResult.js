import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function DemoResult() {
  const location = useLocation();
  const nav = useNavigate();
  const { result } = location.state || {};

  if (!result) return <p className="p-12 text-white text-center">No demo results found. Please restart the analysis.</p>;

  return (
    <div className="min-h-screen bg-[#050814] py-16 px-6 font-sans">
      
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-block px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              Demo Analysis Complete
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Clinical <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Insights</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => nav("/login")}
              className="px-8 py-4 bg-white text-indigo-900 rounded-xl font-bold hover:bg-cyan-400 hover:text-white transition-all shadow-2xl active:scale-95"
            >
              Sign In to Download PDF Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* IMAGE CARD */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 rounded-[2rem] border border-white/10 p-4 shadow-3xl overflow-hidden group relative">
               <img
                 src={result.output_image}
                 alt="Analyzed Cephalogram"
                 className="w-full rounded-2xl grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
               />
               <div className="absolute top-8 left-8 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white text-xs font-bold uppercase tracking-widest">
                 AI Labeled Scan
               </div>
            </div>

            {/* AIRWAY */}
            {result.airway && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl border border-emerald-500/20 p-8 flex items-center justify-between shadow-lg">
                <div>
                  <h4 className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-2">Airway Patency</h4>
                  <div className="text-white text-4xl font-black">{result.airway.upper_airway} <span className="text-sm font-medium text-slate-500 ml-1">mm</span></div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-[10px] font-bold uppercase mb-2">Status</div>
                  <div className="px-5 py-2 rounded-full bg-emerald-500 text-white font-black text-xs uppercase tracking-wider">
                    {result.airway_class}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* METRICS SIDEBAR */}
          <div className="space-y-6">
            
            <div className="bg-white/5 rounded-[2rem] border border-white/10 p-8">
               <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Skeletal Pattern</h4>
               <div className="space-y-4">
                  <MetricRow label="Skeletal Class" val={result.skeletal_class} highlight />
                  <MetricRow label="Maxilla" val={result.maxilla_status} />
                  <MetricRow label="Mandible" val={result.mandible_status} />
                  <MetricRow label="Divergence" val={result.divergence_status} />
               </div>
            </div>

            <div className="bg-white/5 rounded-[2rem] border border-white/10 p-8">
               <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Calculated Metrics</h4>
               <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.angles).map(([k, v]) => (
                    <div key={k} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">{k}</div>
                       <div className="text-white text-lg font-black">{v.toFixed(1)}°</div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 border-dashed rounded-[2rem] text-center">
                <p className="text-slate-500 text-xs font-medium italic">
                    Historical tracking and batch export features are disabled in Demo Mode. 
                </p>
                <button 
                    onClick={() => nav("/login")}
                    className="mt-4 text-cyan-400 text-sm font-bold hover:text-white transition-colors"
                >
                    Create Account for Full Access →
                </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function MetricRow({ label, val, highlight }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-4">
      <span className="text-slate-400 text-xs font-semibold">{label}</span>
      <span className={`font-black ${highlight ? 'text-cyan-400 text-base' : 'text-white text-sm'}`}>{val || "N/A"}</span>
    </div>
  );
}
