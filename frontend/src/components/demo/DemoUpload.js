import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DemoUpload() {
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;
  const nav = useNavigate();

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = () =>
      setFileData({
        file: f,
        fileName: f.name,
        imageData: reader.result,
      });

    reader.readAsDataURL(f);
  };

  const submit = async (mode, isSample = false) => {
    let fileToUpload = fileData?.file;
    
    if (isSample) {
        setLoading(true);
        setError(null);
        try {
            // Using the user-provided sample image
            const response = await fetch("/images/demo_sample.jpg");
            if (!response.ok) throw new Error("Sample image not found in /public/images/demo_sample.jpg");
            const blob = await response.blob();
            fileToUpload = new File([blob], "demo_sample.jpg", { type: "image/jpeg" });
        } catch (e) {
            setError("Sample image not found. Please ensure demo_sample.jpg is in the frontend/public/images/ folder.");
            setLoading(false);
            return;
        }
    }

    if (!fileToUpload) {
      alert("Please upload a cephalogram image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("mode", mode);

      const res = await fetch(`${API_URL}/demo/quick-analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Demo analysis failed. Please try again.");
      }

      const data = await res.json();

      nav("/demo/result", {
        state: { result: data },
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-black py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-12 border border-white/10 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
              Demo Mode
            </div>
            <h2 className="text-5xl font-bold text-white tracking-tight mb-4">
              Try Ceph<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">AI</span> Now
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Experience clinical-grade analysis in one click. Upload your own scan or use our sample dataset.
            </p>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Select Cephalogram
                </label>
                <button 
                    onClick={() => submit("ml", true)}
                    className="text-cyan-400 text-xs font-bold hover:text-cyan-300 underline underline-offset-4"
                >
                    Use Sample X-Ray
                </button>
            </div>
            
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={onFile}
                className="hidden"
                id="demo-file-upload"
              />
              <label
                htmlFor="demo-file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 group"
              >
                {fileData ? (
                  <img
                    src={fileData.imageData}
                    alt="Preview"
                    className="h-full object-contain rounded-2xl p-4"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    </div>
                    <span className="text-white font-bold">Drop image or Click to browse</span>
                    <span className="text-slate-500 text-sm mt-1 text-center px-4">Instant analysis after upload (No manual adjustment in demo)</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center rounded-2xl font-medium">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <button
              onClick={() => !loading && submit("clinical")}
              disabled={loading}
              className="group relative p-8 bg-white/5 border border-white/10 rounded-3xl text-left hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
            >
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-between">
                Clinical
                <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>
              </h3>
              <p className="text-slate-400 text-sm">
                Standard 11-landmark analysis. Optimized for clinical reporting.
              </p>
              {loading && <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center text-white font-bold">Analysing...</div>}
            </button>

            <button
              onClick={() => !loading && submit("ml")}
              disabled={loading}
              className="group relative p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-left hover:shadow-2xl hover:shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-between">
                ML Neural
                <span className="text-white/80 group-hover:translate-x-1 transition-transform">→</span>
              </h3>
              <p className="text-white/70 text-sm">
                19-landmark AI regression. Highest precision anatomical mapping.
              </p>
              {loading && <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center text-white font-bold">Processing Neural Data...</div>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
