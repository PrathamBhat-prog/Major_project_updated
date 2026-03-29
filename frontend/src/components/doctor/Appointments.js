import React, { useState, useEffect, useContext, useCallback } from "react";
import { 
  Copy, Check, Video, Calendar as CalIcon, Clock, 
  ChevronLeft, ChevronRight, UserPlus, FileText,
  User, Phone, Mail, AlertCircle, CheckCircle2, XCircle, Trash2,
  Inbox, ListFilter, CalendarDays, X
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function Appointments() {
  const { currentUser, getAuthHeaders, profile } = useContext(AuthContext);
  const [copied, setCopied] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' or 'all'

  // Suggest Date Modal
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestingFor, setSuggestingFor] = useState(null);
  const [suggestedDate, setSuggestedDate] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("09:00");
  const [actionLoading, setActionLoading] = useState(false);

  // Calendar logic
  const [viewDate, setViewDate] = useState(new Date());
  
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/appointments/`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      
      const data = await response.json();
      setAppointments(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch appointments", err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCopyLink = () => {
    const docId = profile?.id || currentUser?.id;
    if (!docId) {
      alert("User ID not found. Please log out and log in again.");
      return;
    }
    const registrationLink = `${window.location.origin}/register-patient/${docId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(registrationLink);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusUpdate = async (id, newStatus, sugDate = null) => {
    setActionLoading(true);
    try {
      const payload = { status: newStatus };
      if (sugDate) {
        payload.suggested_date = sugDate;
      }

      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      setShowSuggestModal(false);
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuggestSubmit = (e) => {
    e.preventDefault();
    if (!suggestedDate || !suggestedTime) return;
    const fullDate = `${suggestedDate}T${suggestedTime}:00`;
    handleStatusUpdate(suggestingFor.id, 'cancelled', fullDate);
  };

  // Helper to format date
  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const filteredAppointments = appointments.filter(a => isSameDay(new Date(a.appointment_date), selectedDate));

  // Calendar helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prevMonthDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in mb-20">
      
      {/* HEADER & LINK SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-900/5 p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <CalIcon size={24} />
            </div>
            Clinical Schedule
          </h1>
          <p className="text-slate-500 font-semibold mt-2 max-w-md">
            Manage your patient intake workflow and automated appointment bookings.
          </p>
        </div>

        {/* INTAKE LINK CARD */}
        <div className="bg-white p-4 rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-indigo-100 flex flex-col md:flex-row items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <UserPlus size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Public Intake Form</p>
              <p className="text-sm font-bold text-slate-800">Share with new patients</p>
            </div>
          </div>
          <button 
            onClick={handleCopyLink}
            className={`w-full md:w-auto px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2
              ${copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-95' : 'bg-slate-900 text-white hover:bg-indigo-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200'}`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Link Copied!" : "Copy Registration Link"}
          </button>
        </div>
      </div>

      {/* DASHBOARD SUMMARY / INBOX */}
      {pendingAppointments.length > 0 && (
        <div className="bg-indigo-600 rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <Inbox className="text-indigo-200" />
              <h2 className="text-xl font-black tracking-tight">Pending Intake Requests ({pendingAppointments.length})</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {pendingAppointments.slice(0, 3).map(appt => (
              <div key={appt.id} className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-[1.5rem] hover:bg-white/15 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-white">{appt.patient_name}</h3>
                    <p className="text-xs font-bold text-white/60">{formatFullDate(appt.appointment_date)} at {formatTime(appt.appointment_date)}</p>
                  </div>
                  <AlertCircle size={16} className="text-amber-300 animate-pulse" />
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => handleStatusUpdate(appt.id, 'confirmed')}
                    className="flex-1 py-2 bg-white text-indigo-700 rounded-lg text-[10px] font-black hover:bg-indigo-50 transition-all shadow-sm"
                   >
                     Confirm Now
                   </button>
                   <button 
                    onClick={() => {
                      setViewMode('calendar');
                      setSelectedDate(new Date(appt.appointment_date));
                    }}
                    className="px-3 py-2 bg-white/10 text-white rounded-lg text-[10px] font-black hover:bg-white/20 transition-all border border-white/10"
                   >
                     View on Cal
                   </button>
                </div>
              </div>
            ))}
            {pendingAppointments.length > 3 && (
              <div className="flex items-center justify-center p-5 rounded-[1.5rem] border border-dashed border-white/30 cursor-pointer hover:bg-white/5 transition-all" onClick={() => setViewMode('all')}>
                <p className="text-xs font-black uppercase tracking-widest">+ {pendingAppointments.length - 3} More Requests</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN VIEW AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CALENDAR OR LIST VIEW */}
        <div className="lg:col-span-7 space-y-6">
           <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden">
             
             {/* View Toggle */}
             <div className="flex items-center gap-2 mb-8 bg-slate-50 p-1 rounded-2xl w-fit">
               <button 
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <CalIcon size={14} /> Calendar View
               </button>
               <button 
                onClick={() => setViewMode('all')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <ListFilter size={14} /> All Bookings
               </button>
             </div>

             {viewMode === 'calendar' ? (
               <>
                 <div className="flex items-center justify-between mb-10">
                   <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{monthName} {viewDate.getFullYear()}</h2>
                      <p className="text-slate-400 text-sm font-bold">Select a day to view bookings</p>
                   </div>
                   <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
                     <button 
                      onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all hover:shadow-sm"
                     >
                       <ChevronLeft size={20}/>
                     </button>
                     <button 
                      onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all hover:shadow-sm"
                     >
                       <ChevronRight size={20}/>
                     </button>
                   </div>
                 </div>

                 <div className="grid grid-cols-7 gap-4 mb-6">
                   {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                     <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</div>
                   ))}
                 </div>

                 <div className="grid grid-cols-7 gap-3 md:gap-5">
                   {prevMonthDays.map((_, i) => (
                     <div key={`empty-${i}`} className="aspect-square bg-slate-50/50 rounded-2xl opacity-30" />
                   ))}
                   {daysArray.map(day => {
                     const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                     const isActive = isSameDay(dateObj, selectedDate);
                     const isToday = isSameDay(dateObj, new Date());
                     const hasAppts = appointments.some(a => isSameDay(new Date(a.appointment_date), dateObj));

                     return (
                       <button 
                         key={day} 
                         onClick={() => setSelectedDate(dateObj)}
                         className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all group relative
                           ${isActive 
                             ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105 z-10' 
                             : isToday
                               ? 'border-indigo-100 bg-indigo-50 text-indigo-700 font-extrabold'
                               : 'border-transparent text-slate-700 font-bold bg-slate-50/80 hover:bg-white hover:border-indigo-200 hover:shadow-md'}`}
                       >
                         <span className="text-xl md:text-2xl font-black">{day}</span>
                         {hasAppts && (
                           <div className={`absolute bottom-3 w-1.5 h-1.5 rounded-full transition-colors 
                             ${isActive ? 'bg-white shadow-[0_0_8px_white]' : 'bg-indigo-400 group-hover:bg-indigo-600'}`} 
                           />
                         )}
                       </button>
                     )
                   })}
                 </div>
               </>
             ) : (
               <div className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Full Appointment Log</h2>
                  {appointments.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 font-bold">No appointments found in history.</div>
                  ) : (
                    <div className="space-y-3">
                       {appointments.map(appt => (
                         <div key={appt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <div>
                             <p className="font-black text-slate-900">{appt.patient_name}</p>
                             <p className="text-xs font-bold text-slate-500">{formatFullDate(appt.appointment_date)} at {formatTime(appt.appointment_date)}</p>
                           </div>
                           <div className="flex items-center gap-3">
                             <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-lg border
                               ${appt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                 appt.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                 appt.status === 'completed' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                                 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                               {appt.status}
                             </span>
                             <button 
                               onClick={() => {
                                 setSelectedDate(new Date(appt.appointment_date));
                                 setViewMode('calendar');
                               }}
                               className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200"
                             >
                               <ChevronRight size={18} />
                             </button>
                           </div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
             )}
           </div>
        </div>

        {/* RIGHT COLUMN: BOOKINGS LIST */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] h-full flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {isSameDay(selectedDate, new Date()) ? "Today's Schedule" : `${formatFullDate(selectedDate)}`}
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{filteredAppointments.length} Appointments</p>
              </div>
              <button 
                onClick={fetchAppointments}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
              >
                <AlertCircle size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                  <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="font-bold text-sm text">Syncing...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10 opacity-60">
                  <CalIcon size={48} strokeWidth={1} className="mb-4" />
                  <p className="font-extrabold text-lg">No bookings yet</p>
                </div>
              ) : (
                filteredAppointments.map((appt) => (
                  <div key={appt.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-indigo-500 bg-indigo-50 w-fit px-2 py-0.5 rounded-lg mb-2">
                            <Clock size={12} /> {formatTime(appt.appointment_date)}
                         </div>
                         <h3 className="font-black text-slate-900 text-lg leading-tight">{appt.patient_name}</h3>
                         <div className="flex flex-col gap-1 mt-2">
                           {appt.patient_phone && <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Phone size={12} className="text-slate-400"/> {appt.patient_phone}</p>}
                           {appt.patient_email && <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Mail size={12} className="text-slate-400"/> {appt.patient_email}</p>}
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {appt.status === 'confirmed' && <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100">Confirmed</span>}
                        {appt.status === 'pending' && <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-lg border border-amber-100 animate-pulse">Pending</span>}
                        {appt.status === 'completed' && <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg border border-indigo-100">Visited</span>}
                        {appt.status === 'cancelled' && <span className="px-2 py-1 bg-slate-100 text-slate-400 text-[10px] font-black uppercase rounded-lg border border-slate-200">Cancelled</span>}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                      {appt.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(appt.id, 'confirmed')}
                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={14} /> Confirm
                          </button>
                          <button 
                            onClick={() => {
                              setSuggestingFor(appt);
                              setSuggestedDate(new Date(appt.appointment_date).toISOString().split('T')[0]);
                              setShowSuggestModal(true);
                            }}
                            className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl"
                            title="Reject/Reschedule"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      {appt.status === 'confirmed' && (
                        <button 
                          onClick={() => handleStatusUpdate(appt.id, 'completed')}
                          className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <Check size={14} /> Visited
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SUGGEST DATE MODAL */}
      {showSuggestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Reject & Suggest Date</h3>
                <button onClick={() => setShowSuggestModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400"><X /></button>
              </div>
              <form onSubmit={handleSuggestSubmit} className="p-8 space-y-6">
                 <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-xs font-bold flex items-start gap-3">
                   <AlertCircle size={16} className="shrink-0 mt-0.5" />
                   <p>This slot is not available. Send an alternative time to <b>{suggestingFor?.patient_name}</b> via email?</p>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Suggested Date</label>
                       <div className="relative">
                          <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            required 
                            type="date"
                            value={suggestedDate}
                            onChange={e => setSuggestedDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Suggested Time</label>
                       <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            required 
                            type="time"
                            value={suggestedTime}
                            onChange={e => setSuggestedTime(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-col gap-3">
                   <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="w-full py-4 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 disabled:opacity-50"
                   >
                     {actionLoading ? "Sending Email..." : "Reject & Send Suggestion"}
                   </button>
                   <button 
                    type="button" 
                    onClick={() => handleStatusUpdate(suggestingFor.id, 'cancelled')}
                    className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                   >
                     Just Cancel (No Suggestion)
                   </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
