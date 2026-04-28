import React from "react";
import { 
  Cpu, ShieldCheck, Zap, Activity, 
  ArrowRight, CheckCircle2, Laptop, Smartphone,
  BarChart3, Layers, FileText, Share2, ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Learnmore() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-white font-sans overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-8 backdrop-blur-md">
           <Smartphone size={12} className="inline md:hidden" />
           <Laptop size={12} className="hidden md:inline" />
           Clinical Intelligence Engine
        </div>
        
        <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[1.1] mb-8">
          AI-Powered <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            Cephalometric Intelligence
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12">
          Automated landmark detection, classification, & clinical insights. Engineered for the modern orthodontic practice.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
          <button onClick={() => navigate("/demo")} className="px-10 py-4 bg-cyan-500 text-[#050a1a] rounded-lg font-bold text-sm hover:bg-white transition-all shadow-lg shadow-cyan-500/20 active:scale-95">
            Try Free Demo
          </button>
          <button onClick={() => navigate("/login")} className="px-10 py-4 bg-white/5 border border-white/10 rounded-lg font-bold text-sm hover:bg-white/10 transition-all backdrop-blur-md active:scale-95">
            Login to Portal
          </button>
        </div>

        {/* Restore Hero Image Center */}
        <div className="max-w-4xl mx-auto relative group animate-float">
           <div className="absolute inset-0 bg-cyan-500/10 blur-[120px] rounded-full opacity-30"></div>
           <img 
             src="/images/skull_medical_analysis.png" 
             alt="Clinical AI Analysis" 
             className="w-full h-auto rounded-[2rem] border border-white/10 shadow-3xl grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" 
           />
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-md py-12">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
            <div className="space-y-2">
               <div className="text-4xl font-bold text-white">2.4<span className="text-sm font-medium text-slate-400 ml-1">s</span></div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Analysis Speed</p>
            </div>
            <div className="space-y-2">
               <div className="text-4xl font-bold text-white">11 / 19</div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Anatomical Benchmarks</p>
            </div>
         </div>
      </section>

      {/* 3. PRECISION SUITE */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
           <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-[0.3em] mb-4">Precision Suite</h2>
           <h3 className="text-4xl md:text-6xl font-bold tracking-tight leading-none mb-6">Engineered for Precision</h3>
           <p className="text-slate-500 max-w-xl mx-auto font-medium">Harness the power of neural networks trained for specialized anatomical precision.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
           <FeatureCard 
             icon={<Cpu size={32} />}
             title="Neural Landmark Detection"
             desc="Our proprietary AI identifies 11 and 19 diagnostic landmarks in seconds with sub-millimeter clinical accuracy."
             highlight
           />
           <FeatureCard 
             icon={<Layers size={32} />}
             title="Automated Classification"
             desc="Instantly analyze skeletal patterns and dentofacial relationships with peer-validated clinical models."
           />
           <FeatureCard 
             icon={<Activity size={32} />}
             title="Airway Analysis"
             desc="Identify pharyngeal space restrictions with AI-assisted 2D volumetric estimations for surgical planning."
           />
           <FeatureCard 
             icon={<ClipboardList size={32} />}
             title="Interactive Adjustments"
             desc="Maintain complete clinical control. Refine AI-suggested points ensure your expert judgment is final."
           />
        </div>
      </section>

      {/* 4. WORKFLOW SECTION */}
      <section className="py-32 bg-white/[0.01] border-y border-white/5 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-16">Seamless Clinical Workflow</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
               <WorkflowIcon icon={<FileText size={24} />} label="Upload" desc="DICOM/JPEG Secure Intake" />
               <WorkflowIcon icon={<Layers size={24} />} label="Convert" desc="AI-Powered Point Mapping" />
               <WorkflowIcon icon={<Share2 size={24} />} label="Adjust" desc="Precision Clinical Tuning" />
               <WorkflowIcon icon={<CheckCircle2 size={24} />} label="Export" desc="Ready Analysis Reports" />
            </div>
         </div>
      </section>

      {/* 5. PRACTICE ELEVATION */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
         <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10">
               <div>
                  <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-[0.3em] mb-4">The Clinical Advantage</h2>
                  <h3 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">Elevate Your Practice Standard</h3>
               </div>
               
               <div className="space-y-6">
                  <BenefitItem title="Eliminate Inter-Observer Variability" desc="Consistent results every time, regardless of the clinician performing the analysis." />
                  <BenefitItem title="60% Reduction in Analysis Time" desc="Reclaim hours each week by automating manual tracing and clinical calculations." />
                  <BenefitItem title="Patient Engagement Score" desc="Communicate treatment plans more effectively with clear visual AI-augmented reports." />
               </div>
            </div>
            
            <div className="flex-1 w-full max-w-xl">
               <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl">
                  <img src="/images/doctor_clinical_review.png" alt="Clinical Workflow" className="w-full h-auto opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent opacity-60"></div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. CTA FOOTER */}
      <section className="py-32 px-6">
         <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-900/20 to-cyan-900/20 border border-white/10 rounded-[3rem] p-12 md:p-24 text-center backdrop-blur-xl">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Ready for the Future?</h2>
            <p className="text-slate-400 max-w-lg mx-auto font-medium mb-12">Join modern practices worldwide using CephaloAI for clinical diagnostics and superior patient outcomes.</p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button onClick={() => navigate("/login")} className="px-12 py-5 bg-cyan-500 text-[#050a1a] rounded-lg font-bold hover:bg-white transition-all shadow-xl shadow-cyan-500/20 active:scale-95">
                Create Free Account
              </button>
              <button onClick={() => navigate("/demo")} className="px-12 py-5 bg-transparent border border-white/20 text-white rounded-lg font-bold hover:bg-white/5 transition-all active:scale-95">
                Launch Instant Demo
              </button>
            </div>
         </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5 backdrop-blur-sm">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                     <Activity className="text-white" size={16} strokeWidth={3} />
                  </div>
                  <span className="text-xl font-bold tracking-tight">CephaloAI</span>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-wider font-bold">Bringing anatomical precision to clinical orthodontics.</p>
            </div>
            
            <FooterColumn title="Product" links={["Features", "Integrations", "API Access", "Pricing"]} />
            <FooterColumn title="Legal" links={["HIPAA Compliance", "Privacy Policy", "Terms of Service", "Security"]} />
            <FooterColumn title="Company" links={["About Us", "Careers", "Clinical Data", "Contact"]} />
         </div>
         
         <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            <p>© 2026 CEPHALO AI CLINICAL SYSTEMS. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8 mt-6 md:mt-0">
               <Share2 size={16} className="hover:text-white cursor-pointer transition-colors" />
               <Activity size={16} className="hover:text-white cursor-pointer transition-colors" />
               <Laptop size={16} className="hover:text-white cursor-pointer transition-colors" />
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, highlight }) {
  return (
    <div className={`p-10 rounded-[2rem] border transition-all group backdrop-blur-md ${highlight ? 'bg-white/[0.03] border-cyan-500/30 shadow-lg shadow-cyan-500/5' : 'bg-transparent border-white/5 hover:border-white/20'}`}>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-8 ${highlight ? 'bg-cyan-500 text-[#050a1a]' : 'bg-white/5 text-slate-300'} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold text-white mb-4 tracking-tight">{title}</h4>
      <p className="text-sm text-slate-500 font-medium leading-relaxed group-hover:text-slate-400 transition-colors">{desc}</p>
    </div>
  );
}

function WorkflowIcon({ icon, label, desc }) {
   return (
      <div className="flex flex-col items-center text-center space-y-4">
         <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shadow-inner backdrop-blur-md">
            {icon}
         </div>
         <div className="space-y-1">
            <h5 className="font-bold text-white tracking-tight">{label}</h5>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{desc}</p>
         </div>
      </div>
   );
}

function BenefitItem({ title, desc }) {
   return (
      <div className="flex gap-4 group">
         <div className="mt-1.5 w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-[#050a1a] transition-all">
            <CheckCircle2 size={12} />
         </div>
         <div>
            <h5 className="font-bold text-white mb-1">{title}</h5>
            <p className="text-sm text-slate-500">{desc}</p>
         </div>
      </div>
   );
}

function FooterColumn({ title, links }) {
   const navigate = useNavigate();
   
   const handleLink = (link) => {
      console.log("Navigating to:", link);
      const l = link.toLowerCase();
      
      // Force scroll to top on any navigation
      window.scrollTo({ top: 0, behavior: 'auto' });

      if (["features", "integrations", "api access", "pricing"].includes(l)) {
         navigate("/lm");
      } else if (["about us", "contact", "clinical data", "careers", "hipaa compliance", "privacy policy", "terms of service", "security"].includes(l)) {
         navigate("/");
      } else {
         navigate("/");
      }
   };

   return (
      <div className="space-y-6">
         <h5 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">{title}</h5>
         <ul className="space-y-4">
            {links.map(l => (
               <li 
                 key={l} 
                 onClick={() => handleLink(l)}
                 className="text-xs text-slate-500 hover:text-cyan-400 cursor-pointer transition-all duration-200 font-bold uppercase tracking-widest flex items-center gap-2 group"
               >
                 <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 scale-0 group-hover:scale-100 transition-transform"></span>
                 {l}
               </li>
            ))}
         </ul>
      </div>
   );
}
