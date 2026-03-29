import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  UserPlus,
  LogOut,
  ScanLine,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, profile } = useContext(AuthContext);

  const menuItems = [
    { name: "My Work", icon: <LayoutDashboard size={20} />, path: "/doctor/dashboard" },
    { name: "Calendar", icon: <Calendar size={20} />, path: "/doctor/appointments" },
    { name: "New Patient", icon: <UserPlus size={20} />, path: "/doctor/create-patient" },
    { name: "Add X-Ray", icon: <Upload size={20} />, path: "/doctor/upload-cephalogram" },
    { name: "Message Admin", icon: <MessageSquare size={20} />, path: "/doctor/chat" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className="w-80 bg-white flex flex-col h-screen border-r border-slate-100 shadow-xl z-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Brand Header */}
      <div className="h-24 flex items-center px-10 border-b border-slate-50 shrink-0 bg-white">
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
             D
           </div>
           <div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 block leading-none">
                Cephalo<span className="text-indigo-600">AI</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Doctor Workspace</span>
           </div>
         </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-10 px-6 custom-scrollbar bg-white">
        <p className="px-5 text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-6">
          Clinical Menu
        </p>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 group relative
                  ${isActive 
                    ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                    : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50 border border-transparent"}`}
              >
                <span className={`transition-all duration-300 ${isActive ? "text-indigo-600 scale-110" : "text-slate-300 group-hover:text-indigo-600 group-hover:scale-110"}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">{item.name}</span>
                {isActive && <span className="absolute left-0 w-1.5 h-6 bg-indigo-600 rounded-r-full"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-8 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
         <div className="flex items-center gap-4 overflow-hidden cursor-pointer w-full group" onClick={() => navigate("/doctor/profile")}>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
              {(profile?.full_name?.[0] || currentUser?.username?.[0] || "D").toUpperCase()}
            </div>
            <div className="truncate flex-1">
              <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1.5">
                Dr. {profile?.full_name || currentUser?.username || "Practitioner"}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Edit Profile</p>
            </div>
         </div>
         <button
            onClick={handleLogout}
            className="p-3.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all shrink-0 active:scale-95"
         >
            <LogOut size={20} />
         </button>
      </div>

    </div>
  );
}