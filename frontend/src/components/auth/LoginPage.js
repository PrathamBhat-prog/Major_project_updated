import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, UserPlus, Shield, ChevronRight, AlertCircle, Info, Activity } from "lucide-react";

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
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-transparent px-6 py-12 animate-fade-in relative overflow-hidden">
      
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-16 lg:gap-24">
        
        {/* Left Side: Branding/Informational */}
        <div className="flex-1 space-y-8 hidden lg:block max-w-sm">
           <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <Activity size={32} />
           </div>
           <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">
                Clinical <br/>
                <span className="text-indigo-400">Excellence.</span>
              </h1>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                Securely access your diagnostic suite and generate precision reports.
              </p>
           </div>
           
           <div className="flex items-center gap-3 text-amber-500 font-bold text-[10px] uppercase tracking-[0.2em] pt-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Secure Gateway Active
           </div>
        </div>

        {/* Right Side: Log In Form */}
        <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-10 md:p-12 text-white overflow-hidden">
          
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2 uppercase italic">
              {isRegister ? "Onboard Practitioner" : "Auth Portal"}
            </h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">
              {isRegister 
                ? "Join the Next-Gen Registry" 
                : "Synchronize Session"}
            </p>
          </div>

          <form
            onSubmit={isRegister ? handleRegister : handleLogin}
            className="space-y-6"
          >
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Account Identifier</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors">
                   <Mail size={18} />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@clinic.io"
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 pl-12 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all font-bold text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Credential</label>
                 {!isRegister && (
                   <Link to="/forgot-password" size={14} className="text-[10px] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-widest">
                      Lost Key?
                   </Link>
                 )}
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors">
                   <Lock size={18} />
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 pl-12 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all font-bold text-sm"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Session Scope</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors pointer-events-none">
                   <Shield size={18} />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/10 px-6 py-4 pl-12 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-bold text-sm cursor-pointer"
                >
                  <option value="doctor" className="bg-[#05080c] text-white">Practitioner (Doctor)</option>
                  <option value="admin" className="bg-[#05080c] text-white">Administrator (Host)</option>
                </select>
              </div>
            </div>

            {(error || registerError) && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-[10px] font-bold animate-in fade-in duration-300 flex items-center gap-3 uppercase tracking-wider">
                <AlertCircle size={16} />
                {error || registerError}
              </div>
            )}

            <button
              disabled={loading || registerLoading}
              className="w-full py-5 bg-white text-indigo-900 rounded-[2rem] font-black text-sm transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 hover:bg-indigo-50 shadow-2xl shadow-indigo-500/20"
            >
              {isRegister ? <><UserPlus size={18} /> Onboard</> : <><LogIn size={18} /> Sign In</>}
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="mt-10 text-center">
             <button
               onClick={() => {
                 setIsRegister(!isRegister);
                 setRegisterError(null);
               }}
               className="text-[11px] font-black text-white/30 hover:text-white transition-all uppercase tracking-[0.2em]"
             >
               {isRegister ? "Already Licensed? Access Portal" : "New User? Request Access"}
             </button>
             
             <div className="flex items-center justify-center gap-2 text-slate-600 text-[10px] uppercase font-bold tracking-widest mt-8">
                <Info size={12} /> Clinical Stable v2.4.9
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
