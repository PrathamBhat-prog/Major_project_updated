import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { User, Activity, FileText, TrendingUp, Users, Shield, Cpu, Zap, MessageSquare, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function AdminDashboard() {
  const { getAuthHeaders, currentUser } = useContext(AuthContext);

  const [patients, setPatients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const masterEmails = ["guru819773@gmail.com", "gurunathagoudambiradar@gmail.com", "gurunathagouda@gmail.com"];
  const isMaster = masterEmails.includes(currentUser?.username?.toLowerCase());

  // ================= MAIN DATA FETCH (30s POLLING) =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        const [pRes, prRes, uRes] = await Promise.all([
          fetch(`${API_URL}/admin/patients`, { headers }),
          fetch(`${API_URL}/admin/predictions`, { headers }),
          fetch(`${API_URL}/admin/users`, { headers }),
        ]);

        if (pRes.ok) setPatients(await pRes.json());
        if (prRes.ok) setPredictions(await prRes.json());
        if (uRes.ok) setUsers(await uRes.json());
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // 1 minute to reduce log noise
    return () => clearInterval(interval);
  }, [getAuthHeaders]);

  // ================= MASTER HOST POLLING (60s) =================
  useEffect(() => {
    if (!isMaster) return;

    const fetchPendingAdmins = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/admin/pending-approvals`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          setPendingAdmins(data || []);
        }
      } catch (e) {
        console.error("Host poll error:", e);
      }
    };

    fetchPendingAdmins();
    const interval = setInterval(fetchPendingAdmins, 30000);
    return () => clearInterval(interval);
  }, [isMaster, getAuthHeaders]);

  const handleApprove = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/auth/admin/approve/${userId}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setPendingAdmins(prev => prev.filter(u => u.id !== userId));
        // Force refresh users list
        const uRes = await fetch(`${API_URL}/admin/users`, { headers: getAuthHeaders() });
        if (uRes.ok) setUsers(await uRes.json());
      }
    } catch (err) { console.error(err); }
  };

  // ================= DERIVED DATA =================
  const totalPatients = patients.length;
  const totalPredictions = predictions.length;
  const totalDoctors = users.filter((u) => u.role === "doctor").length;

  const doctorMap = {};
  users.forEach((u) => {
    if (u.role === "doctor") {
      const id = String(u.id ?? u.user_id ?? u._id);
      const name = u.full_name || u.username.split('@')[0] || `Doc ${id}`;
      doctorMap[id] = name;
    }
  });

  const doctorPatients = {};
  patients.forEach((p) => {
    const docId = String(p.owner_id ?? p.doctor_id ?? p.user_id);
    if (!docId) return;
    doctorPatients[docId] = (doctorPatients[docId] || 0) + 1;
  });

  const doctorPredictions = {};
  predictions.forEach((p) => {
    const docId = String(p.owner_id ?? p.doctor_id ?? p.user_id);
    if (!docId) return;
    doctorPredictions[docId] = (doctorPredictions[docId] || 0) + 1;
  });

  const doctorChartData = Object.keys(doctorPatients).map((docId) => ({
    name: doctorMap[docId] || "External",
    patients: doctorPatients[docId],
  }));

  const modeTotals = { auto: 0, manual: 0 };
  predictions.forEach((p) => {
    const mode = p.mode?.toLowerCase() === "auto" ? "auto" : "manual";
    modeTotals[mode]++;
  });

  const modeStats = [
    { name: "Autonomous Mode", value: modeTotals.auto },
    { name: "Manual Refinement", value: modeTotals.manual },
  ];

  const PIE_COLORS = ["#4f46e5", "#06b6d4"];

  if (loading && patients.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Master Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-12 max-w-[1600px] mx-auto animate-fade-in font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 mt-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">{isMaster ? "Global Host Intelligence" : "Usage Trends"}</h1>
          <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">{isMaster ? "Master node authorization & platform health" : "Global Platform Analytics"}</p>
        </div>
        <div className="flex items-center gap-4">
           {isMaster && (
             <div className="flex items-center gap-2 bg-indigo-600 px-5 py-2.5 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200">
                <Shield size={14} /> Master Node Active
             </div>
           )}
           <div className="flex items-center gap-2 bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-widest">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
           </div>
        </div>
      </div>

      {/* ================= MASTER ADMIN APPROVALS (HOST HUB) ================= */}
      {isMaster && (
        <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 border border-indigo-500 rounded-[4rem] p-16 shadow-2xl shadow-indigo-300 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex items-center gap-10 text-center lg:text-left">
                 <div className="p-8 bg-white text-indigo-900 rounded-[2.5rem] shadow-2xl">
                    <Shield size={48} />
                 </div>
                 <div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-4">Pending Authorization Hub</h2>
                    <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs flex items-center gap-3">
                       {pendingAdmins.length > 0 ? (
                         <><span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span> {pendingAdmins.length} Nodes awaiting global authorization</>
                       ) : (
                         <><CheckCircle size={16} /> All administrative nodes authorized</>
                       )}
                    </p>
                 </div>
              </div>
              <div className="flex flex-wrap gap-5 justify-center">
                 {pendingAdmins.map(u => (
                    <div key={u.id} className="p-6 bg-white/10 border border-white/20 rounded-[2.5rem] backdrop-blur-md flex items-center gap-6 group hover:bg-white transition-all duration-500">
                       <span className="text-[11px] font-black text-white group-hover:text-indigo-900 uppercase tracking-widest ml-4">{u.username.split('@')[0]}</span>
                       <button onClick={() => handleApprove(u.id)} className="px-8 py-4 bg-white text-indigo-600 rounded-3xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all shadow-xl active:scale-95 group-hover:bg-indigo-600 group-hover:text-white">
                          Authorize Node
                       </button>
                    </div>
                 ))}
                 {pendingAdmins.length === 0 && (
                   <p className="text-indigo-200/50 font-black uppercase text-[10px] tracking-[0.3em] italic">No pending requests in queue</p>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Total Registry Patients" value={totalPatients} icon={<Users size={28} />} accent="bg-indigo-50 text-indigo-600 border-indigo-100" isMaster={isMaster} />
        <StatCard title="AI Analysis Count" value={totalPredictions} icon={<Cpu size={28} />} accent="bg-cyan-50 text-cyan-600 border-cyan-100" isMaster={isMaster} />
        <StatCard title="Authorized Clinicians" value={totalDoctors} icon={<Shield size={28} />} accent="bg-violet-50 text-violet-600 border-violet-100" isMaster={isMaster} />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[4rem] p-14 border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="mb-14 flex items-center justify-between">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Productivity Map</h2>
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp size={24} /></div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: 'rgba(79, 70, 229, 0.03)' }} contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '1.5rem', fontWeight: 'bold' }} />
                <Bar dataKey="patients" fill="#4f46e5" radius={[12, 12, 12, 12]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[4rem] p-14 border border-slate-100 shadow-xl shadow-slate-200/50">
           <div className="mb-14 flex items-center justify-between">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">AI Penetration</h2>
             <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl"><Zap size={24} /></div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modeStats} dataKey="value" cx="50%" cy="50%" innerRadius={100} outerRadius={140} paddingAngle={10}>
                  {modeStats.map((entry, i) => <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />)}
                </Pie>
                <Legend layout="horizontal" verticalAlign="bottom" align="center" formatter={(value) => <span className="text-slate-500 font-bold uppercase text-[11px] tracking-widest ml-2">{value}</span>} />
                <Tooltip contentStyle={{ borderRadius: '2rem', border: 'none', padding: '1rem', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= DOCTOR LIST ================= */}
      <div className="bg-white rounded-[4rem] p-16 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-12 uppercase">Clinician Master Registry</h2>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-y-6">
            <thead>
              <tr className="bg-slate-50/50 rounded-2xl">
                <th className="py-6 px-10 text-[11px] font-black text-slate-400 uppercase tracking-widest rounded-l-2xl">Identity</th>
                <th className="py-6 px-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Volume</th>
                <th className="py-6 px-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Automation</th>
                <th className="py-6 px-10 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest rounded-r-2xl">Status</th>
              </tr>
            </thead>
            <tbody className="font-bold">
              {Object.keys(doctorPatients).map((docId) => {
                const targetUser = users.find(u => String(u.id ?? u.user_id ?? u._id) === String(docId));
                // Robust SQLite boolean handling
                const isApproved = targetUser?.is_approved === true || targetUser?.is_approved === 1 || targetUser?.is_approved === "1";
                const isActive = targetUser?.is_active === true || targetUser?.is_active === 1 || targetUser?.is_active === "1";

                let statusLabel = "Pending Auth";
                let statusColor = "bg-amber-50 text-amber-700 border-amber-100";
                let dotColor = "bg-amber-500 shadow-amber-500";

                if (isApproved) {
                  if (isActive) {
                    statusLabel = "Operational";
                    statusColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                    dotColor = "bg-emerald-500 shadow-emerald-500";
                  } else {
                    statusLabel = "Deactivated";
                    statusColor = "bg-rose-50 text-rose-700 border-rose-100";
                    dotColor = "bg-rose-500 shadow-rose-500";
                  }
                }

                return (
                 <tr key={docId} className="group hover:scale-[1.01] transition-all duration-300">
                   <td className="py-8 px-10 bg-white border-y border-l border-slate-100 rounded-l-[2rem] shadow-sm">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-indigo-500/30 uppercase">{doctorMap[docId]?.charAt(0) || "D"}</div>
                         <div>
                            <p className="text-slate-900 text-lg font-black tracking-tight leading-none mb-2">{doctorMap[docId] || "External User"}</p>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Node Channel: {docId}</p>
                         </div>
                      </div>
                   </td>
                   <td className="py-8 px-6 text-center text-slate-900 text-lg border-y border-slate-100 shadow-sm">{doctorPatients[docId]} pts</td>
                   <td className="py-8 px-6 text-center text-indigo-600 text-lg border-y border-slate-100 shadow-sm font-black">{doctorPredictions[docId] || 0} scans</td>
                   <td className="py-8 px-10 text-right bg-white border-y border-r border-slate-100 rounded-r-[2rem] shadow-sm">
                      <span className={`px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2.5 ${statusColor} border`}>
                         <span className={`w-2 h-2 rounded-full ${dotColor} shadow-[0_0_8px]`}></span>
                         {statusLabel}
                      </span>
                   </td>
                 </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, accent, isMaster }) {
  return (
    <div className={`p-12 rounded-[4rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 hover:-translate-y-2 transition-all group hover:shadow-2xl`}>
      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner border shadow-sm transition-transform group-hover:scale-110 duration-500 ${accent}`}>{icon}</div>
      <div>
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-2 leading-none">{value}</h2>
        <span className="font-extrabold text-2xl tracking-tight text-slate-900 block leading-none">
          {isMaster ? "Cephalo" : "Cephalo"}<span className="text-indigo-600">{isMaster ? "Host" : "AI"}</span>
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">{isMaster ? "Primary Control Node" : "Admin Central"}</span>
      </div>
    </div>
  );
}