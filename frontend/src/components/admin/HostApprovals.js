import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Shield, ShieldAlert, CheckCircle, XCircle, Users, Activity, ExternalLink } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function HostApprovals() {
  const { getAuthHeaders, currentUser } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHostData = async () => {
    try {
      const headers = getAuthHeaders();
      const [allRes, pendRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/auth/admin/pending-approvals`, { headers })
      ]);

      if (allRes.ok) {
        const allUsers = await allRes.json();
        const masterEmailsEnv = process.env.REACT_APP_MASTER_EMAILS || "";
        const masterEmails = masterEmailsEnv ? masterEmailsEnv.split(",").map(e => e.trim().toLowerCase()) : [];
        // Filter only other admins (approved)
        setAdmins(allUsers.filter(u => u.role === "admin" && u.is_approved && !masterEmails.includes(u.username.toLowerCase())));
      }
      if (pendRes.ok) {
        setPending(await pendRes.json());
      }
    } catch (err) {
      console.error("Host fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostData();
  }, [getAuthHeaders]);

  const handleAction = async (userId, action) => {
    const endpoint = action === "approve" ? `${API_URL}/auth/admin/approve/${userId}` : `${API_URL}/admin/toggle-user/${userId}`;
    const method = action === "approve" ? "POST" : "PUT";

    try {
      const res = await fetch(endpoint, { method, headers: getAuthHeaders() });
      if (res.ok) fetchHostData();
    } catch (err) { console.error(err); }
  };

  const masterEmailsEnv = process.env.REACT_APP_MASTER_EMAILS || "";
  const masterEmails = masterEmailsEnv ? masterEmailsEnv.split(",").map(e => e.trim().toLowerCase()) : [];
  if (!masterEmails.includes(currentUser?.username?.toLowerCase())) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-10">
         <div className="bg-white p-16 rounded-[4rem] border-2 border-rose-500 shadow-2xl text-center space-y-8 max-w-2xl animate-fade-in font-sans">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
               <ShieldAlert size={48} />
            </div>
            <div className="space-y-4">
               <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic leading-none">Security Breach Detected</h1>
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest leading-loose italic">Administrative management restricted to Primary Master Node only. Your access attempt has been logged for security forensics.</p>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-12 max-w-[1400px] mx-auto animate-fade-in font-sans">
      
      {/* HOST HEADER */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-black p-16 rounded-[4rem] border border-white/10 shadow-3xl text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
         <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-6">
                <div className="p-5 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/30">
                   <Shield size={32} />
                </div>
                <div>
                   <h1 className="text-4xl font-black tracking-tight leading-none mb-3 italic uppercase">Administration Hierarchy</h1>
                   <div className="flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                      Master Node Authority Established
                   </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
               <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-2">
                  <p className="text-amber-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 italic">
                     <ShieldAlert size={14} /> Pending Auth
                  </p>
                  <p className="text-5xl font-black text-white">{pending.length}</p>
               </div>
               <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-2">
                  <p className="text-emerald-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 italic">
                     <Users size={14} /> Operational Nodes
                  </p>
                  <p className="text-5xl font-black text-white">{admins.length}</p>
               </div>
            </div>
         </div>
      </div>

      {/* PENDING HUB */}
      <section className="space-y-8">
         <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic leading-none">Authorization Queue</h2>
            <div className="h-0.5 flex-1 bg-slate-100 mx-8"></div>
         </div>

         {pending.length === 0 ? (
           <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-20 text-center animate-fade-in">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                 <CheckCircle size={32} />
              </div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic leading-loose">Queue Clear: All administrative requests processed.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pending.map(u => (
                <div key={u.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10 group hover:-translate-y-2 transition-all duration-500">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 font-bold text-xl shadow-sm italic uppercase">
                         {u.username[0]}
                      </div>
                      <div className="truncate">
                         <p className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2 truncate uppercase italic">{u.username.split('@')[0]}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{u.username}</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleAction(u.id, "approve")}
                     className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/40 hover:bg-slate-900 transition-all active:scale-95"
                   >
                     Authorize Node
                   </button>
                </div>
              ))}
           </div>
         )}
      </section>

      {/* ADMINS LIST */}
      <section className="bg-white rounded-[4rem] p-16 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-12">
         <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Administrative Tier</h2>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
               <Activity size={24} />
            </div>
         </div>

         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-y-6">
               <thead>
                  <tr className="bg-slate-50/50 rounded-2xl">
                     <th className="py-6 px-10 text-[11px] font-black text-slate-400 uppercase tracking-widest rounded-l-2xl">Admin Entity</th>
                     <th className="py-6 px-10 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Connectivity</th>
                     <th className="py-6 px-10 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest rounded-r-2xl">Control Matrix</th>
                  </tr>
               </thead>
               <tbody>
                  {admins.map(admin => (
                    <tr key={admin.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                       <td className="py-8 px-10 border-y border-l border-slate-100 rounded-l-[2rem] bg-white group-hover:bg-slate-50/50 shadow-sm transition-colors">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-500 font-black text-xl italic uppercase">
                               {admin.username[0]}
                            </div>
                            <div>
                               <p className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2 italic uppercase">{admin.username.split('@')[0]}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{admin.username}</p>
                            </div>
                          </div>
                       </td>
                       <td className="py-8 px-10 text-center border-y border-slate-100 bg-white group-hover:bg-slate-50/50 shadow-sm transition-colors">
                          <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-3 ${admin.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                             <span className={`w-2 h-2 rounded-full ${admin.is_active ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`}></span>
                             {admin.is_active ? "Operational" : "Offline"}
                          </span>
                       </td>
                       <td className="py-8 px-10 text-right border-y border-r border-slate-100 rounded-r-[2rem] bg-white group-hover:bg-slate-50/50 shadow-sm transition-colors">
                          <button 
                            onClick={() => handleAction(admin.id, "toggle")}
                            className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                               admin.is_active ? 'bg-rose-600 text-white shadow-rose-200 hover:bg-slate-900' : 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-slate-900'
                            }`}
                          >
                             {admin.is_active ? "Revoke Access" : "Restore Access"}
                          </button>
                       </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                       <td colSpan="3" className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic">No secondary administrators detected.</td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </section>
    </div>
  );
}
