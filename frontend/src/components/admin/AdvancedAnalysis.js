import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  BarChart3,
  Activity,
  ArrowRight,
  Info,
  Download
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ================= STATISTICAL HELPERS =================

// Numerical approximation for the Error Function (erf)
function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

// CDF for Standard Normal Distribution
function n_cdf(z) {
  return (1 + erf(z / Math.sqrt(2))) / 2;
}

// Calculate P-value for Pearson correlation (Z-approximation for n > 2)
function calculatePValue(r, n) {
  if (n <= 2) return 1.0;
  // Fisher Transformation/t-test approximation: t = r * sqrt((n-2)/(1-r^2))
  const df = n - 2;
  const t = r * Math.sqrt(df / (1.0 - r * r + 1e-15));
  // Two-tailed p-value using Z-approximation (accurate for n > 30, good estimate for smaller)
  const p = 2 * (1 - n_cdf(Math.abs(t)));
  return Math.max(0, Math.min(1.0, p));
}

function getSignificanceMarkers(p) {
  if (p < 0.001) return { text: "p < 0.001", marker: "***", class: "text-emerald-500 font-black", level: "Strongly Significant" };
  if (p < 0.01) return { text: `p = ${p.toFixed(3)}`, marker: "**", class: "text-emerald-400 font-bold", level: "Highly Significant" };
  if (p < 0.05) return { text: `p = ${p.toFixed(3)}`, marker: "*", class: "text-blue-400 font-bold", level: "Significant" };
  return { text: `p = ${p.toFixed(3)}`, marker: "N.S.", class: "text-slate-400 font-medium", level: "Not Significant" };
}

export default function AdvancedAnalysis() {
  const { getAuthHeaders } = useContext(AuthContext);
  const [dbData, setDbData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [tab, setTab] = useState("db");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const headerElement = document.getElementById("pdf-official-header");
      const reportElement = document.getElementById("report-container");
      
      // Temporarily display the official header
      headerElement.style.display = "flex";
      
      const forceGrid = [
        { id: "grid-stats", temp: "grid grid-cols-4 gap-6 avoid-break" },
        { id: "grid-charts", temp: "grid grid-cols-2 gap-8 avoid-break" },
        { id: "grid-radar", temp: "grid grid-cols-3 gap-8 avoid-break" }
      ];
      
      const prev = {};
      forceGrid.forEach(f => {
        const el = document.getElementById(f.id);
        if (el) {
          prev[f.id] = el.className;
          el.className = f.temp;
        }
      });

      // Force wide container exactly mimicking desktop
      const defaultWidth = reportElement.style.width;
      reportElement.style.width = "1280px";

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const pdfWidth = canvas.width / 2;
      const pdfHeight = canvas.height / 2;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CephAI_Insights_${tab.toUpperCase()}.pdf`);
      
      headerElement.style.display = "none";
      reportElement.style.width = defaultWidth;
      forceGrid.forEach(f => {
        const el = document.getElementById(f.id);
        if (el) el.className = prev[f.id];
      });
      
      
    } catch (err) {
      console.error(err);
      alert("Error generating graphical PDF report.");
      const headerElement = document.getElementById("pdf-official-header");
      if(headerElement) headerElement.style.display = "none";
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = getAuthHeaders();
        const [dbRes, exRes] = await Promise.all([
          fetch(`${API_URL}/admin/predictions`, { headers }),
          fetch(`${API_URL}/admin/master-excel-data`, { headers })
        ]);
        setDbData(await dbRes.json());
        setExcelData(await exRes.json());
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const rawData = tab === "db" ? dbData : excelData;
  const metrics = ["SNB", "SNA", "YEN", "SN_GoGn"];

  const getAirwayValue = (d) => d?.airway?.upper_airway ?? d?.upper_airway ?? d?.airway_width ?? null;
  const getMetricValue = (d, key) => {
    if (key === "SN_GoGn") return d?.angles?.["SN_GoGn"] ?? d?.["SN_GoGn"] ?? d?.["SN_GOGN"] ?? null;
    return d?.angles?.[key] ?? d?.[key] ?? null;
  };

  const clean = (v) => {
    if (v === null || v === undefined) return null;
    const num = parseFloat(v);
    return isNaN(num) ? null : num;
  };

  const getPairs = (key) => {
    return rawData
      .map(d => ({ x: clean(getMetricValue(d, key)), y: clean(getAirwayValue(d)) }))
      .filter(p => p.x !== null && p.y !== null)
      .sort((a, b) => a.x - b.x);
  };

  const calculateCorrelation = (pairs) => {
    const n = pairs.length;
    if (n < 2) return { r: 0, p: 1 };
    const sx = pairs.reduce((s, p) => s + p.x, 0);
    const sy = pairs.reduce((s, p) => s + p.y, 0);
    const sxy = pairs.reduce((s, p) => s + p.x * p.y, 0);
    const sx2 = pairs.reduce((s, p) => s + p.x * p.x, 0);
    const sy2 = pairs.reduce((s, p) => s + p.y * p.y, 0);
    const num = n * sxy - sx * sy;
    const den = Math.sqrt((n * sx2 - sx * sx) * (n * sy2 - sy * sy));
    const r = den === 0 ? 0 : num / den;
    const p = calculatePValue(r, n);
    return { r, p, n };
  };

  const interpretCorrelation = (r) => {
    const abs = Math.abs(r);
    if (abs > 0.7) return r > 0 ? "Strong Positive" : "Strong Negative";
    if (abs > 0.3) return r > 0 ? "Moderate Positive" : "Moderate Negative";
    if (abs > 0.1) return r > 0 ? "Weak Positive" : "Weak Negative";
    return "No Correlation";
  };

  const calculateRegression = (pairs) => {
    const n = pairs.length;
    if (n < 2) return { slope: 0, intercept: 0 };
    const sx = pairs.reduce((s, p) => s + p.x, 0);
    const sy = pairs.reduce((s, p) => s + p.y, 0);
    const sxy = pairs.reduce((s, p) => s + p.x * p.y, 0);
    const sx2 = pairs.reduce((s, p) => s + p.x * p.x, 0);
    const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    const intercept = (sy - slope * sx) / n;
    return { slope, intercept };
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Analyzing Dataset...</div>;

  return (
    <div id="report-container" className="p-4 md:p-8 space-y-12 bg-[#f8fafc] min-h-screen text-slate-900 font-sans">
      
      {/* HIDDEN OFFICIAL HEADER (Visible only during PDF Generation) */}
      <div id="pdf-official-header" style={{ display: 'none' }} className="w-full flex justify-between items-center bg-[#e0ecff] p-6 border-b-[6px] border-indigo-800 rounded-2xl">
         <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-white rounded-xl shadow-md p-1 flex items-center justify-center border-2 border-indigo-100 overflow-hidden shrink-0">
               <img src="/logo.png" alt="DSCDS Logo" className="w-full h-full object-contain" />
             </div>
             <div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">Dayananda Sagar College of Dental Sciences</h1>
                <p className="text-base font-bold text-slate-600">Department of Orthodontics</p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">CephAI Clinical Report</span>
                   <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] uppercase">
                     {tab === "db" ? "Live Database" : "Master Excel"}
                   </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">Generated on: {new Date().toLocaleString()}</p>
             </div>
         </div>
      </div>

      {/* PROFESSIONAL HEADER SECTION */}
      <section data-html2canvas-ignore="true" className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-2 border border-indigo-100">
            <Zap size={14} className="fill-indigo-600" /> Statistical Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-800">
            Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Correlations</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed">
            Quantitative analysis linking craniofacial landmarks with obstructive airway parameters.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 z-10 shrink-0">
          <div className="flex bg-slate-100 p-2 rounded-[2rem] gap-2 border border-slate-200">
            <button
              onClick={() => setTab("db")}
              className={`px-8 py-3 rounded-[1.5rem] font-black text-sm transition-all flex items-center gap-2 ${
                tab === "db" ? "bg-white text-indigo-600 shadow-xl" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Activity size={18} /> LIVE DB
            </button>
            <button
              onClick={() => setTab("excel")}
              className={`px-8 py-3 rounded-[1.5rem] font-black text-sm transition-all flex items-center gap-2 ${
                tab === "excel" ? "bg-white text-emerald-600 shadow-xl" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <BarChart3 size={18} /> MASTER EXCEL
            </button>
          </div>
          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className={`px-6 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-lg border ${
              downloading ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            }`}
          >
            <Download size={14} /> {downloading ? "GENERATING PDF..." : "DOWNLOAD CLINICAL REPORT"}
          </button>
        </div>
      </section>

      {/* CORE METRIC STAT CARDS */}
      <section id="grid-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 avoid-break">
        <AnimatePresence mode="popLayout">
          {metrics.map((k, idx) => {
            const stats = calculateCorrelation(getPairs(k));
            const sig = getSignificanceMarkers(stats.p);
            const interpret = interpretCorrelation(stats.r);

            return (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col justify-between group transition-all avoid-break"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-500 border border-slate-100 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                    {stats.r > 0 ? <TrendingUp size={24} /> : stats.r < 0 ? <TrendingDown size={24} /> : <Minus size={24} />}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${sig.marker === "N.S." ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                    Sig: {sig.marker}
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none mb-1">{k} Correlation</h4>
                  <div className="text-4xl font-black text-slate-800 mb-2 leading-none flex items-baseline gap-1">
                    {stats.r.toFixed(3)}
                    <span className="text-xs font-medium text-slate-400"> (r)</span>
                  </div>
                  <p className="text-indigo-600 font-bold text-sm leading-tight flex items-center gap-2">
                    {interpret} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] uppercase font-black tracking-tight">
                  <span className={sig.class}>{sig.text}</span>
                  <span className="text-slate-400">N = {stats.n}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>

      {/* DETAILED ANALYSIS GRID */}
      <section id="grid-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-8 avoid-break">
        {metrics.map((key, idx) => {
          const pairs = getPairs(key);
          const stats = calculateCorrelation(pairs);
          const { slope, intercept } = calculateRegression(pairs);
          const sig = getSignificanceMarkers(stats.p);

          const minX = pairs[0]?.x || 0;
          const maxX = pairs[pairs.length - 1]?.x || 100;
          const lineData = Array.from({ length: 20 }, (_, i) => {
            const x = minX + (i / 19) * (maxX - minX);
            return { x, y: slope * x + intercept };
          });

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.15 + 0.4 }}
              className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden avoid-break"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight">Correlation: {key}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs font-black uppercase tracking-wider ${sig.class}`}>
                      {sig.level}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">• r = {stats.r.toFixed(3)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-xl">
                    y = {slope.toFixed(2)}x + {intercept.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      domain={['auto', 'auto']} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                      axisLine={false}
                      tickLine={false}
                      label={{ value: `${key} (degrees)`, position: 'bottom', offset: -10, fontStyle: 'italic', fill: '#cbd5e1', fontSize: 10 }}
                    />
                    <YAxis 
                      type="number" 
                      domain={['auto', 'auto']} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                      axisLine={false}
                      tickLine={false}
                      label={{ value: 'Airway Width (mm)', angle: -90, position: 'insideLeft', fontStyle: 'italic', fill: '#cbd5e1', fontSize: 10 }}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontWeight: 800 }} />
                    <Scatter name={`${key} Distribution`} data={pairs} fill="#6366f1" fillOpacity={0.4} stroke="#4f46e5" strokeWidth={1} isAnimationActive={false} />
                    <Line type="monotone" data={lineData} dataKey="y" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 group">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                   <Info size={20} />
                </div>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  The regression line indicates a <b>{interpretCorrelation(stats.r).toLowerCase()}</b> trend. Average airway width changes by <b>{Math.abs(slope).toFixed(2)}mm</b> for every degree of <b>{key}</b> change.
                </p>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* RADAR & TABLE SECTION */}
      <section id="grid-radar" className="grid grid-cols-1 xl:grid-cols-3 gap-8 avoid-break">
        
        {/* RADAR CHART */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center xl:col-span-1 avoid-break">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Influence Radar</h3>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] mt-1">Global Sensitivity Map</p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={metrics.map(k => {
                const stats = calculateCorrelation(getPairs(k));
                return { metric: k, value: Math.abs(stats.r) };
              })}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontWeight: 900, fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fontSize: 10, fill: '#cbd5e1' }} axisLine={false} />
                <Radar name="Correlation Strength" dataKey="value" stroke="#818cf8" strokeWidth={4} fill="#6366f1" fillOpacity={0.2} isAnimationActive={false} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', fontWeight: 800 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 w-full">
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center">
              <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Max Influence</div>
              <div className="text-lg font-black text-indigo-600">
                {metrics[metrics.length - 1]}
              </div>
            </div>
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-center">
              <div className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-1">Total Pairs</div>
              <div className="text-lg font-black text-purple-600">{rawData.length}</div>
            </div>
          </div>
        </div>

        {/* ANALYSIS TABLES */}
        <div className="xl:col-span-2 space-y-8">
           <div className="bg-slate-900 p-8 md:p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
             <h3 className="text-3xl font-black mb-1 leading-none tracking-tight">Phenotype Mapping</h3>
             <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-10 overflow-hidden">Group-based averaging indicators</p>

             <div className="space-y-12">
                {[...metrics.slice(0, 2), "Airway Width"].map((key) => {
                  const groups = {};
                  rawData.forEach(d => {
                    const cls = d.skeletal_class || "Unknown";
                    const div = d.divergence_status || "Unknown";
                    if (!groups[cls]) groups[cls] = {};
                    if (!groups[cls][div]) groups[cls][div] = [];
                    const val = key === "Airway Width" ? clean(getAirwayValue(d)) : clean(getMetricValue(d, key));
                    if (val !== null) groups[cls][div].push(val);
                  });

                  const unit = key === "Airway Width" ? "mm" : "°";
                  const icon = key === "Airway Width" ? <Activity size={16} /> : <BarChart3 size={16} />;

                  return (
                    <div key={key}>
                       <div className="flex items-center gap-3 mb-6">
                         <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-400">
                            {icon}
                         </div>
                         <h4 className="text-xl font-black tracking-tight">{key} by Skeletal Class</h4>
                       </div>

                       <div className="space-y-6">
                         {Object.keys(groups).filter(c => c !== "Unknown").map(cls => (
                            <div key={cls} className="space-y-3 avoid-break">
                               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{cls}</div>
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 {["Normodivergent", "Hypodivergent", "Hyperdivergent"].map(div => {
                                    const vals = groups[cls][div] || [];
                                    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "0.00";
                                    return (
                                      <div key={div} className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md group hover:bg-white/10 transition-colors">
                                         <p className="text-indigo-300 font-black uppercase text-[9px] tracking-widest leading-none mb-2">{div}</p>
                                         <div className="text-3xl font-black group-hover:scale-110 transition-transform origin-left">{avg}{unit}</div>
                                      </div>
                                    );
                                 })}
                               </div>
                            </div>
                         ))}
                       </div>
                    </div>
                  );
                })}
             </div>
           </div>
        </div>
      </section>

    </div>
  );
}