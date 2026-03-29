import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error("Failed to send reset email");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center bg-[#0a0c10] overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      
      <div className="max-w-md w-full relative z-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all font-bold text-sm mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
          {success ? (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
               <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 size={40} />
               </div>
               <div className="space-y-2">
                 <h2 className="text-3xl font-black text-white">Check Your Mail</h2>
                 <p className="text-slate-400 font-medium leading-relaxed">
                   If <b>{email}</b> is registered, you'll receive a password reset link shortly.
                 </p>
               </div>
               <div className="pt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase text-indigo-400 tracking-widest leading-relaxed">
                  Link expires in 60 minutes
               </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="space-y-2">
                  <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-2">Password Recovery</h1>
                  <p className="text-slate-500 font-bold">Forgotten your credentials? Enter your email to receive a recovery link.</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                 {error && (
                   <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2">
                     <AlertCircle size={14} /> {error}
                   </div>
                 )}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Email</label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                       <input 
                         required
                         type="email"
                         placeholder="name@example.com"
                         value={email}
                         onChange={e => setEmail(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold placeholder:text-slate-600"
                       />
                    </div>
                 </div>
                 <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                 >
                   {loading ? "Sending..." : <>Send Recovery Link <ChevronRight size={18} /></>}
                 </button>
               </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
