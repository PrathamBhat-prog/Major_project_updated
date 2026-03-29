import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Bell, Settings, SearchIcon } from "lucide-react";

export default function DoctorHeader({ searchTerm, setSearchTerm }) {
  const { currentUser, profile, unreadCount } = useContext(AuthContext);

  return (
    <header className="w-full bg-white border-b border-slate-100 px-10 py-8 flex items-center justify-between sticky top-0 z-40 shadow-sm font-sans">
      
      {/* LEFT: Contextual Search */}
      <div className="flex-1 max-w-xl hidden lg:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <SearchIcon size={20} className="text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm || ""}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH PATIENT ARCHIVE..."
            className="w-full pl-14 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900 placeholder-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center gap-10">
        
        {/* Quick Indicators */}
        <div className="flex items-center gap-4">
           <button className="relative p-4 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 shadow-sm">
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-3.5 right-3.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-lg animate-pulse"></span>
              )}
           </button>
           <button className="p-4 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 shadow-sm">
              <Settings size={22} />
           </button>
        </div>

        <div className="h-10 w-px bg-slate-100"></div>

        {/* User Identity */}
        <div className="flex items-center gap-6 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-2 group-hover:text-indigo-600 transition-colors uppercase">
              DR. {profile?.full_name || currentUser?.username || "PROFESSIONAL"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">
              DENTAL AUTHORITY
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-2xl shadow-indigo-500/20 group-hover:rotate-12 transition-all duration-300 border-2 border-white/10 shrink-0">
             {(profile?.full_name?.[0] || currentUser?.username?.[0] || "D").toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}