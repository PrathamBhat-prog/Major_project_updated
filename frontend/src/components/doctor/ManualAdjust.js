import React, { useState, useRef, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ManualAdjust() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getAuthHeaders } = useContext(AuthContext);

  const {
    patientId,
    imageFile,
    previewImage,
    predictedLandmarks,
    mode,
  } = location.state || {};

  const landmarkNames = {
    P1: "Sella",
    P2: "Nasion",
    P3: "Orbitale",
    P4: "Porion",
    P5: "Point A",
    P6: "Point B",
    P7: "Pogonion",
    P8: "Menton",
    P9: "Gnathion",
    P10: "Gonion",
    P11: "Incision Inferius",
    P12: "Incision Superius",
    P13: "Upper Lip",
    P14: "Lower Lip",
    P15: "Subnasale",
    P16: "Soft Tissue Pogonion",
    P17: "Posterior Nasal Spine",
    P18: "Anterior Nasal Spine",
    P19: "Articulare",
    P20: "PB Upper",
    P21: "Anterior Border Upper",
    P22: "M-Point",
    P23: "G-Point",
  };

  const API_URL = process.env.REACT_APP_API_URL;
  const imageRef = useRef(null);

  const [landmarks, setLandmarks] = useState([]);
  const [originalLandmarks, setOriginalLandmarks] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!predictedLandmarks) return;
    const initial = predictedLandmarks.map(lm => ({ ...lm, isExtra: false }));
    setLandmarks(initial);
    setOriginalLandmarks(JSON.parse(JSON.stringify(initial)));
  }, [predictedLandmarks]);

  if (!previewImage || !landmarks.length)
    return <p className="p-8">Invalid navigation state</p>;

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

  const resetSelected = () => {
    if (selectedIndex === null || selectedIndex === -1) return;
    if (!landmarks[selectedIndex].isExtra) {
      const updated = [...landmarks];
      updated[selectedIndex] = originalLandmarks[selectedIndex];
      setLandmarks(updated);
    }
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
      const headers = getAuthHeaders();
      delete headers["Content-Type"];

      const endpoint = mode === "clinical" 
        ? `${API_URL}/clinical-finalize/${patientId}` 
        : `${API_URL}/ml-finalize/${patientId}`;

      const res = await fetch(endpoint, { method: "POST", headers, body: formData });
      if (!res.ok) throw new Error("Finalization failed");

      const data = await res.json();
      navigate(`/doctor/landmark/${data.id}`);
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
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* IMAGE */}
      <div className="lg:col-span-2 flex justify-center items-start overflow-hidden w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-2 sm:p-4 min-h-[60vh]">
        <div
          className="relative w-full rounded-xl shadow-xl bg-black leading-[0] border border-slate-200 overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ display: "block" }}
        >
          <img
            ref={imageRef}
            src={previewImage}
            alt="Cephalogram"
            className="w-full h-auto m-0 p-0 select-none pointer-events-none block"
            draggable={false}
            onLoad={() => setImgLoaded(true)}
          />

          {landmarks.map((p, i) => {
            const isActive = selectedIndex === -1 || i === selectedIndex;
            const modified = isModified(i);

            return (
              <div
                key={i}
                onMouseDown={() => handleMouseDown(i)}
                className={`absolute rounded-full cursor-pointer border shadow-sm
                  ${p.isExtra ? "bg-purple-500 border-purple-200" 
                    : isActive ? "bg-indigo-500 border-indigo-200" 
                    : modified ? "bg-teal-500 border-teal-200" 
                    : "bg-rose-500 border-rose-200"}`}
                style={{
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                  width: size,
                  height: size,
                  transform: "translate(-50%, -50%)",
                  zIndex: isActive ? 20 : 10
                }}
                title={`${p.name} - ${landmarkNames[p.name] || "Extra Landmark"}`}
              />
            );
          })}
        </div>
      </div>

      {/* SIDE PANEL */}
      <div className="flex flex-col h-full space-y-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm leading-tight">
          <h2 className="text-xl font-extrabold text-slate-800">
            Manual Tuning <span className="text-sm font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md ml-1">{mode?.toUpperCase()}</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">Drag and drop markers for surgical precision.</p>
        </div>

        {/* LIVE CEPHALOMETRIC METRICS */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">Live Telemetry</h3>
          <div className="grid grid-cols-2 gap-2">
            <MetricBox label="SNA" val={SNA} />
            <MetricBox label="SNB" val={SNB} />
            <MetricBox label="ANB" val={ANB} />
            <MetricBox label="YEN" val={YEN} />
            <div className="col-span-2">
                <MetricBox label="SN to GoGn" val={SN_GoGn} />
            </div>
          </div>
        </div>

        {/* POINT DETAILS & LIST */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[400px]">
           {selectedIndex !== null && selectedIndex !== -1 && (
            <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0">
              <div className="flex items-end justify-between mb-2">
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Active Marker</div>
                    <div className="text-lg font-black text-indigo-600 leading-none">{landmarks[selectedIndex].name}</div>
                 </div>
                 <button
                   onClick={resetSelected}
                   className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors"
                 >
                   Revert Point
                 </button>
              </div>
              <div className="text-xs font-mono text-slate-500">
                 [ {(landmarks[selectedIndex].x * 100).toFixed(1)}%, {(landmarks[selectedIndex].y * 100).toFixed(1)}% ]
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {landmarks.map((p, i) => (
              <div
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`p-3 cursor-pointer rounded-xl text-sm font-bold border-2 transition-all group flex justify-between items-center mb-1
                  ${i === selectedIndex 
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                    : "border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-100"}`}
              >
                <span>{p.name} <span className="text-slate-400 font-medium ml-1">— {landmarkNames[p.name] || "Extra"}</span></span>
                {isModified(i) && <span className="w-2 h-2 rounded-full bg-teal-400"></span>}
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-2 shrink-0">
          {mode === "ml" && (
            <div className="flex gap-2">
              <button onClick={addPoint} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors">
                + Add Point
              </button>
              <button onClick={deleteSelectedPoint} className="flex-1 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm rounded-xl transition-colors">
                Delete Extra
              </button>
            </div>
          )}

          <div className="flex gap-2">
             <button onClick={applyAll} className="flex-1 py-3 bg-slate-800 text-white hover:bg-slate-700 font-bold text-sm rounded-xl transition-all shadow-sm">
                Apply Drag
             </button>
             <button onClick={resetAll} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all">
                Reset All
             </button>
          </div>

          <button
            onClick={finalize}
            disabled={loading}
            className={`w-full py-4 text-white font-black rounded-xl shadow-lg transition-all ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:-translate-y-0.5 hover:shadow-indigo-500/30'}`}
          >
            {loading ? "Processing..." : "Finalize Coordinates"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, val }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="font-mono font-bold text-indigo-600 text-sm">
         {val !== null ? val.toFixed(1) + '°' : '--'}
      </span>
    </div>
  );
}
