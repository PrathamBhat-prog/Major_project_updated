import React, { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  User,
  Image,
  MessageSquare,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar() {
  const { token, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const masterEmailsEnv = process.env.REACT_APP_MASTER_EMAILS || "";
  const masterEmails = masterEmailsEnv ? masterEmailsEnv.split(",").map(e => e.trim().toLowerCase()) : [];
  const isMaster = masterEmails.includes(currentUser?.username?.toLowerCase());

  const menu = [
    { name: "Analytics Overview", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Activity Reports", path: "/admin/analytics", icon: <BarChart3 size={20} /> },
    { name: "Clinician Directory", path: "/admin/manage-doctors", icon: <Users size={20} /> },
    { name: "Patient Registry", path: "/admin/patients", icon: <User size={20} /> },
    { name: "Clinical Analysis", path: "/admin/predictions", icon: <Image size={20} /> },
    { name: "Diagnostic Insights", path: "/admin/advancedanalytics", icon: <BarChart3 size={20} /> },
    { name: "Communications Hub", path: "/admin/chat", icon: <MessageSquare size={20} /> }
  ];

  if (isMaster) {
    menu.splice(2, 0, { name: "Admins List", path: "/admin/host-approvals", icon: <ShieldCheck size={20} /> });
  }

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

  return (
    <div className="w-80 bg-white flex flex-col h-screen border-r border-slate-100 shadow-xl z-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Brand Header */}
      <div className="h-24 flex items-center px-10 border-b border-slate-50 shrink-0 bg-white">
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
             {isMaster ? <ShieldCheck size={22} /> : "A"}
           </div>
           <div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 block leading-none">
                Cephalo<span className="text-indigo-600">AI Admin</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Global Management Console</span>
           </div>
         </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-10 px-6 custom-scrollbar bg-white">
        <div className="mb-6">
          <p className="px-5 text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-6">
            Management
          </p>
          <div className="space-y-2">
            {menu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 group relative
                    ${isActive 
                      ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                      : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"}`}
                >
                  <span className={`${isActive ? "text-indigo-600" : "text-slate-300 group-hover:text-indigo-600"} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold">{item.name}</span>
                  {isActive && <span className="absolute left-0 w-1.5 h-6 bg-indigo-600 rounded-r-full"></span>}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-8 border-t border-slate-50 flex items-center justify-between shrink-0 bg-white">
         <div className="flex items-center gap-4 overflow-hidden cursor-pointer w-full group" onClick={() => navigate("/admin/profile")}>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
              {isMaster ? <ShieldCheck size={22} className={profile?.full_name ? "" : "text-indigo-600 group-hover:text-white"} /> : (profile?.full_name?.[0] || "A").toUpperCase()}
            </div>
            <div className="truncate pr-2">
              <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1.5">{profile?.full_name || "Admin Mode"}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Edit Settings</p>
            </div>
         </div>
         <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              navigate("/login");
            }}
            className="p-3.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all shrink-0 active:scale-95"
         >
            <LogOut size={20} />
         </button>
      </div>

    </div>
  );
}