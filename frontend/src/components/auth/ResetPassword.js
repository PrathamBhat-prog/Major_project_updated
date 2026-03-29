import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle2, ChevronRight, AlertCircle, Key } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!token) {
      setError("No reset token found. Please check your recovery email.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      });

      if (!response.ok) {
         const data = await response.json();
         throw new Error(data.detail || "Reset failed. Link may be expired.");
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center bg-[#0a0c10] overflow-hidden relative">
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
          {success ? (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
               <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 size={40} />
               </div>
               <div className="space-y-2">
                 <h2 className="text-3xl font-black text-white px-2">Password Updated</h2>
                 <p className="text-slate-400 font-medium">Your credentials have been securely reset. You can now log in with your new password.</p>
               </div>
               <button 
                  onClick={() => navigate("/login")}
                  className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl"
               >
                  Go to Login <ChevronRight size={18} />
               </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="space-y-2">
                  <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-6">
                     <Key size={28} />
                  </div>
                  <h1 className="text-4xl font-black text-white tracking-tight leading-tight">Create New Password</h1>
                  <p className="text-slate-500 font-bold">Please set a strong, unique password for your CephaloAI clinical account.</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                 {error && (
                   <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2">
                     <AlertCircle size={14} /> {error}
                   </div>
                 )}
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                       <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                          <input 
                            required
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold placeholder:text-slate-600"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                       <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                          <input 
                            required
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold placeholder:text-slate-600"
                          />
                       </div>
                    </div>
                 </div>
                 <button 
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                 >
                   {loading ? "Updating..." : <>Update Password <ChevronRight size={18} /></>}
                 </button>
               </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
