import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, UserPlus, Shield, ChevronRight, AlertCircle, Info } from "lucide-react";

export default function LoginPage() {
  const { login, error, loading, currentUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [isRegister, setIsRegister] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const nav = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    const ok = await login(email, password, role);
    if (ok) {
      const userRole = currentUser?.role || role;
      if (userRole === "admin") nav("/admin/dashboard");
      else if (userRole === "doctor") nav("/doctor/dashboard");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password, role }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed");
      }

      const ok = await login(email, password);
      if (ok) {
        const userRole = currentUser?.role || role;
        if (userRole === "admin") nav("/admin/dashboard");
        else if (userRole === "doctor") nav("/doctor/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setRegisterError(err.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center bg-transparent animate-fade-in relative z-10">
      
      {/* Narrative Context for Desktop */}
      <div className="hidden lg:flex flex-col max-w-lg mr-20 space-y-8">
         <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white">
            <Shield size={32} />
         </div>
         <h1 className="text-6xl font-black text-white leading-none uppercase tracking-tighter">
            Clinical <br/> Access <br/> Portal
         </h1>
         <p className="text-slate-500 font-medium text-xl leading-relaxed">
            Enter your credentials to access precision diagnostics, case telemetry, and automated analysis reports.
         </p>
         <div className="flex items-center gap-3 text-amber-500 font-black text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Federated Security Active
         </div>
      </div>

      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl p-10 md:p-14 text-white overflow-hidden transition-all duration-500">
        
        {/* Accent Glow */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="mb-10">
          <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase italic">
            {isRegister ? "Onboard User" : "Auth Portal"}
          </h2>
          <p className="text-slate-500 font-bold text-sm">
            {isRegister 
              ? "Join the next generation of orthodontics." 
              : "Synchronize clinical session."}
          </p>
        </div>

        <form
          onSubmit={isRegister ? handleRegister : handleLogin}
          className="space-y-6"
        >
          {/* Email Input */}
          <div className="space-y-2 group">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={20} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@clinical.io"
                className="w-full bg-white/5 border border-white/10 px-6 py-4 pl-12 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-bold"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2 group">
            <div className="flex justify-between items-center ml-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
               {!isRegister && (
                 <Link to="/forgot-password" size={14} className="text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-widest">
                    Forgot?
                 </Link>
               )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={20} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 px-6 py-4 pl-12 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-bold"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2 group">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Session Scope</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={20} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none bg-white/10 border border-white/10 px-6 py-4 pl-12 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-bold cursor-pointer"
              >
                <option value="doctor" className="bg-[#05080c] text-white">Practitioner (Doctor)</option>
                <option value="admin" className="bg-[#05080c] text-white">Administrator (Admin)</option>
              </select>
            </div>
          </div>

          {(error || registerError) && (
            <div className="glass-panel border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold animate-in fade-in duration-300 flex items-center gap-3">
              <AlertCircle size={16} />
              {error || registerError}
            </div>
          )}

          <button
            disabled={loading || registerLoading}
            className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 hover:bg-slate-200"
          >
            {isRegister ? <><UserPlus size={20} /> Onboard</> : <><LogIn size={20} /> Sign In</>}
            <ChevronRight size={20} />
          </button>
        </form>

        <div className="mt-12 text-center flex flex-col items-center gap-4">
           <button
             onClick={() => {
               setIsRegister(!isRegister);
               setRegisterError(null);
             }}
             className="text-xs font-black text-white/50 hover:text-white transition-all uppercase tracking-widest"
           >
             {isRegister ? "Already Licensed? Access Portal" : "New Practitioner? Request License"}
           </button>
           
           <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-black tracking-widest mt-4">
              <Info size={12} /> Version Stable v2.4.9
           </div>
        </div>
      </div>
    </div>
  );
}
