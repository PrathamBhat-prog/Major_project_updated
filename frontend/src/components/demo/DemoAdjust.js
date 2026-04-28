import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function DemoAdjust() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    imageFile,
    previewImage,
    predictedLandmarks,
    mode,
  } = location.state || {};

  const landmarkNames = {
    P1: "Sella", P2: "Nasion", P3: "Orbitale", P4: "Porion", P5: "Point A",
    P6: "Point B", P7: "Pogonion", P8: "Menton", P9: "Gnathion", P10: "Gonion",
    P11: "Incision Inferius", P12: "Incision Superius", P13: "Upper Lip",
    P14: "Lower Lip", P15: "Subnasale", P16: "Soft Tissue Pogonion",
    P17: "Posterior Nasal Spine", P18: "Anterior Nasal Spine", P19: "Articulare",
    P20: "PB Upper", P21: "Anterior Border Upper", P22: "M-Point", P23: "G-Point",
  };

  const API_URL = process.env.REACT_APP_API_URL;
  const imageRef = useRef(null);

  const [landmarks, setLandmarks] = useState([]);
  const [originalLandmarks, setOriginalLandmarks] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!predictedLandmarks) return;
    const initial = predictedLandmarks.map(lm => ({ ...lm, isExtra: false }));
    setLandmarks(initial);
    setOriginalLandmarks(JSON.parse(JSON.stringify(initial)));
  }, [predictedLandmarks]);

  if (!previewImage || !landmarks.length)
    return <p className="p-8 text-white">Invalid demo state. Please restart.</p>;

  const handleMouseDown = (index) => {
    setSelectedIndex(index);
    setDragging(true);
  };
  
  const size = Math.max(4, imageRef.current?.width * 0.010 || 6);
  
  const handleMouseUp = () => setDragging(false);

  const handleMouseMove = (e) => {
    if (!dragging || selectedIndex === null) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const clampedX = Math.min(Math.max(x, 0), 1);
    const clampedY = Math.min(Math.max(y, 0), 1);

    const updated = [...landmarks];
    updated[selectedIndex] = {
      ...updated[selectedIndex],
      x: parseFloat(clampedX.toFixed(4)),
      y: parseFloat(clampedY.toFixed(4)),
    };
    setLandmarks(updated);
  };

  const addPoint = () => {
    if (mode === "clinical") {
      alert("Clinical mode does not allow extra landmarks.");
      return;
    }
    const extraCount = landmarks.filter(l => l.isExtra).length;
    if (extraCount >= 5) {
      alert("Maximum 5 extra landmarks allowed.");
      return;
    }
    setLandmarks([...landmarks, { name: `P${landmarks.length + 1}`, x: 0.5, y: 0.5, isExtra: true }]);
  };

  const deleteSelectedPoint = () => {
    if (selectedIndex === null) return;
    if (!landmarks[selectedIndex].isExtra) {
      alert("Core landmarks cannot be deleted.");
      return;
    }
    const updated = landmarks.filter((_, i) => i !== selectedIndex);
    setLandmarks(updated);
    setSelectedIndex(null);
  };

  const resetAll = () => {
    setLandmarks(JSON.parse(JSON.stringify(originalLandmarks)));
    setSelectedIndex(null);
  };

  const applyAll = () => setSelectedIndex(-1);

  const finalize = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("landmarks", JSON.stringify(landmarks));
      formData.append("mode", mode);

      const res = await fetch(`${API_URL}/demo/finalize`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Demo finalization failed");

      const data = await res.json();
      navigate("/demo/result", { state: { result: data } });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isModified = (index) => {
    if (!originalLandmarks[index]) return false;
    return (
      landmarks[index].x !== originalLandmarks[index]?.x ||
      landmarks[index].y !== originalLandmarks[index]?.y
    );
  };

  // ================================
  // LIVE MATH DIAGNOSTICS
  // ================================
  const getPt = (name) => {
    const pt = landmarks.find(l => l.name === name);
    if (!pt || !imageRef.current) return null;
    return {
      x: pt.x * (imageRef.current.naturalWidth || 1),
      y: pt.y * (imageRef.current.naturalHeight || 1),
    };
  };

  const getAngle3P = (pA, pB, pC) => {
    if (!pA || !pB || !pC) return null;
    const a1 = Math.atan2(pA.y - pB.y, pA.x - pB.x);
    const a2 = Math.atan2(pC.y - pB.y, pC.x - pB.x);
    let deg = Math.abs(a1 - a2) * (180 / Math.PI);
    if (deg > 180) deg = 360 - deg;
    return deg;
  };

  const getLineAngle = (p1, p2, p3, p4) => {
    if (!p1 || !p2 || !p3 || !p4) return null;
    const a1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const a2 = Math.atan2(p4.y - p3.y, p4.x - p3.x);
    let deg = Math.abs(a1 - a2) * (180 / Math.PI);
    if (deg > 180) deg = 360 - deg;
    if (deg > 90) deg = 180 - deg;
    return deg;
  };

  const S = getPt("P1");
  const N = getPt("P2");
  const A = getPt("P5");
  const B = getPt("P6");
  const Gn = getPt("P9");
  const Go = getPt("P10");
  const M = getPt("P22");
  const G = getPt("P23");

  const SNA = getAngle3P(S, N, A);
  const SNB = getAngle3P(S, N, B);
  const ANB = (SNA !== null && SNB !== null) ? SNA - SNB : null;
  const SN_GoGn = getLineAngle(S, N, Go, Gn);
  const YEN = getAngle3P(S, M, G);

  return (
    <div className="min-h-screen bg-[#050814] p-6 lg:p-12 font-sans">
      
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white">Manual Refinement</h1>
           <p className="text-slate-400">Fine-tune landmarks for sub-millimeter clinical accuracy.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 font-bold text-sm">
             DEMO MODE
           </div>
           <button onClick={() => navigate("/")} className="text-slate-500 hover:text-white transition-colors text-sm font-bold">
             Exit Demo
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* IMAGE VIEWPORT */}
        <div className="lg:col-span-2 relative bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col p-4 shadow-2xl">
           <div 
             className="relative inline-block cursor-crosshair rounded-2xl overflow-hidden self-center"
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
           >
             <img
               ref={imageRef}
               src={previewImage}
               alt="Demo Cephalogram"
               className="max-h-[70vh] w-auto select-none pointer-events-none shadow-inner"
               draggable={false}
             />
             {landmarks.map((p, i) => (
               <div
                 key={i}
                 onMouseDown={() => handleMouseDown(i)}
                 className={`absolute rounded-full border-2 shadow-lg cursor-move transition-transform hover:scale-150 z-20
                   ${i === selectedIndex ? 'bg-cyan-400 border-white scale-125' : isModified(i) ? 'bg-emerald-400 border-white/50' : p.isExtra ? 'bg-purple-500 border-white/50' : 'bg-rose-500 border-white/50'}`}
                 style={{
                   left: `${p.x * 100}%`,
                   top: `${p.y * 100}%`,
                   width: size,
                   height: size,
                   transform: "translate(-50%, -50%)",
                 }}
                 title={landmarkNames[p.name] || p.name}
               />
             ))}
           </div>

           {/* REAL-TIME OVERLAY (Optional - can add lines here if needed) */}
        </div>

        {/* CONTROLS & TELEMETRY */}
        <div className="space-y-6 flex flex-col">
           
           {/* LIVE TELEMETRY */}
           <div className="bg-white/5 rounded-3xl border border-white/10 p-6">
              <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Live Telemetry</h3>
              <div className="grid grid-cols-2 gap-3">
                 <MetricBox label="SNA" val={SNA} />
                 <MetricBox label="SNB" val={SNB} />
                 <MetricBox label="ANB" val={ANB} />
                 <MetricBox label="YEN" val={YEN} />
                 <div className="col-span-2">
                    <MetricBox label="SN to GoGn" val={SN_GoGn} />
                 </div>
              </div>
           </div>

           {/* DIRECTORY */}
           <div className="bg-white/5 rounded-3xl border border-white/10 p-6 flex-1 flex flex-col min-h-[300px]">
              <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Markers
                 </div>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{landmarks.length} Detected</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar max-h-[300px]">
                 {landmarks.map((p, i) => (
                   <div
                     key={i}
                     onClick={() => setSelectedIndex(i)}
                     className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all border flex items-center justify-between
                       ${i === selectedIndex ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}
                   >
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 leading-none mb-1">{p.name}</span>
                        <span className="font-medium text-xs">{landmarkNames[p.name] || "Extra Landmark"}</span>
                     </div>
                     {isModified(i) && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>}
                   </div>
                 ))}
              </div>

              <div className="mt-6 space-y-3">
                 {mode === "ml" && (
                   <div className="flex gap-2">
                      <button onClick={addPoint} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/5 transition-all">
                        + Add Point
                      </button>
                      <button onClick={deleteSelectedPoint} className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/10 transition-all">
                        Delete
                      </button>
                   </div>
                 )}
                 <div className="flex gap-2">
                    <button onClick={applyAll} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all">
                       Apply
                    </button>
                    <button onClick={resetAll} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold rounded-xl transition-all">
                       Reset
                    </button>
                 </div>
                 <button
                   onClick={finalize}
                   disabled={loading}
                   className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black rounded-2xl shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                 >
                   {loading ? "Running Neural Analysis..." : "Finalize Measurements"}
                 </button>
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}

function MetricBox({ label, val }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white/5 border border-white/5 rounded-xl">
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
      <span className="font-mono font-bold text-cyan-400 text-sm">
         {val !== null ? val.toFixed(1) + '°' : '--'}
      </span>
    </div>
  );
}
