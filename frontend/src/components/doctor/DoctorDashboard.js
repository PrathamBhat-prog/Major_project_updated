import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, X, AlertCircle, Search, Plus, Calendar, Microscope, ChevronRight, Activity, User, FileText, Cpu } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function DoctorDashboard() {
  const { profile, getAuthHeaders } = useContext(AuthContext);
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Verification code logic
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Edit Patient Logic
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: "", dob: "", notes: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        const [patientsRes, predictionsRes] = await Promise.all([
          fetch(`${API_URL}/patients/`, { headers }), // Corrected path from /doctor/patients to /patients/
          fetch(`${API_URL}/doctor/predictions`, { headers }),
        ]);

        if (patientsRes.ok) {
          const pData = await patientsRes.json();
          console.log("Fetched Patients:", pData);
          setPatients(pData || []);
        }
        if (predictionsRes.ok) setPredictions(await predictionsRes.json());
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getAuthHeaders]);

  // Fix Search: Handle null names and simplify filtering
  const filteredPatients = patients.filter(p => {
    if (!searchTerm.trim()) return true;
    const name = p.name || "";
    return name.toLowerCase().includes(searchTerm.trim().toLowerCase());
  });

  const filteredPredictions = selectedPatient ? predictions.filter(pr => pr.patient_id === selectedPatient.id) : [];

  const handleEditPatient = (p) => {
    setPatientToDelete(p);
    setEditData({ name: p.name, dob: p.dob || "", notes: p.notes || "" });
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    try {
      const res = await fetch(`${API_URL}/patients/${patientToDelete.id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const updated = await res.json();
        setPatients(patients.map(p => p.id === updated.id ? updated : p));
        setShowEditModal(false);
      }
    } catch (err) { console.error(err); }
  };

  const requestDeleteOtp = async (patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
    try {
      const res = await fetch(`${API_URL}/patients/${patient.id}/send-delete-code`, {
        method: "POST", headers: getAuthHeaders()
      });
      if (res.ok) setOtpSent(true);
    } catch (err) { console.error(err); }
  };

  const confirmDelete = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`${API_URL}/patients/${patientToDelete.id}?code=${verificationCode}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setPatients(patients.filter(p => p.id !== patientToDelete.id));
        setShowDeleteModal(false);
        setPatientToDelete(null);
        setSelectedPatient(null);
      } else {
        alert("Wrong code. Please try again.");
      }
    } catch (err) { console.error(err); }
    finally { setVerifying(false); }
  };

  if (loading) return (
    <div className="flex flex-col h-full items-center justify-center text-slate-400 font-bold space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="uppercase tracking-widest text-xs">Loading Patient Registry...</p>
    </div>
  );

  return (
    <div className="flex h-full bg-[#f8fafc] gap-8 animate-fade-in relative z-10 font-sans">
      
      {/* SIDEBAR: PATIENT LIST */}
      <div className="w-96 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
        <div className="p-8 border-b border-slate-50 space-y-6 bg-white shrink-0">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Patient List</h2>
             <button onClick={() => navigate("/doctor/create-patient")} className="w-11 h-11 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center hover:bg-slate-900 transition-all active:scale-90">
                <Plus size={22} />
             </button>
          </div>
          <div className="relative group overflow-hidden">
            <Search className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-slate-900 placeholder-slate-300 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar bg-white">
          {filteredPatients.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              className={`p-6 rounded-[2rem] cursor-pointer transition-all border ${selectedPatient?.id === p.id ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm translate-x-1' : 'bg-white border-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-900'}`}
            >
              <div className="font-extrabold text-lg leading-none mb-2">{p.name || "Unnamed Patient"}</div>
              <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${selectedPatient?.id === p.id ? 'text-indigo-400' : 'text-slate-300'}`}>
                <Calendar size={12} /> Registered: {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
          {filteredPatients.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                   <User size={32} />
                </div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No patients found.</p>
             </div>
          )}
        </div>
      </div>

      {/* MAIN VIEW: PATIENT INFORMATION */}
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        {selectedPatient ? (
          <div className="space-y-8 pb-20">
            
            {/* SUBJECT PROFILE HEADER */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex justify-between items-center transition-all hover:shadow-2xl">
              <div className="flex items-center gap-10">
                <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-indigo-500/30 uppercase">
                   {selectedPatient.name?.charAt(0) || "P"}
                </div>
                <div>
                  <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">{selectedPatient.name}</h1>
                  <div className="flex items-center gap-5">
                     <span className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm text-[11px] font-bold text-slate-500 uppercase tracking-widest"><Calendar size={14} className="text-indigo-600"/> DOB: {selectedPatient.dob || "Unknown"}</span>
                     <span className="flex items-center gap-2 bg-indigo-50 px-4 py-2.5 rounded-2xl border border-indigo-100 text-indigo-700 shadow-sm text-xs font-bold leading-none">REF: #{selectedPatient.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => handleEditPatient(selectedPatient)} className="p-4 bg-white text-slate-400 rounded-2xl border border-slate-100 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm active:scale-95">
                    <Edit size={22} />
                 </button>
                 <button onClick={() => requestDeleteOtp(selectedPatient)} className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95">
                    <Trash2 size={22} />
                 </button>
              </div>
            </div>

            {/* QUICK ACTIONS GRID */}
            <div className="grid grid-cols-2 gap-8">
               <button onClick={() => navigate("/doctor/upload-cephalogram")} className="flex items-center gap-8 p-10 bg-white border border-slate-100 rounded-[4rem] shadow-xl shadow-slate-200/50 hover:translate-y-[-6px] transition-all group hover:shadow-2xl">
                  <div className="p-7 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                     <FileText size={40} />
                  </div>
                  <div className="text-left">
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">New AI Scan</h3>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Analyze new cephalogram</p>
                  </div>
               </button>
               <div className="p-10 bg-white border border-slate-100 rounded-[4rem] shadow-xl shadow-slate-200/50 flex items-center gap-8 group">
                  <div className="p-7 bg-indigo-50 text-indigo-600 rounded-[2rem] shadow-inner transition-transform group-hover:rotate-12">
                     <Activity size={40} />
                  </div>
                  <div className="text-left">
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Connection</h3>
                     <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Authorized & Active
                     </p>
                  </div>
               </div>
            </div>

            {/* SCAN HISTORY SECTION */}
            <div className="space-y-6 pt-4">
              <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.4em] ml-8 flex items-center gap-8 leading-none">
                AI SCAN ARCHIVES <span className="h-px bg-slate-100 flex-1"></span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-40">
                {filteredPredictions.map((pr) => (
                  <div key={pr.id} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-8 group hover:border-indigo-600 transition-all cursor-pointer hover:shadow-2xl active:scale-95" onClick={() => navigate(`/doctor/classification/${pr.id}`)}>
                    <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                       <Cpu size={36} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-2xl mb-2 tracking-tight leading-none">View Analysis</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                         <ChevronRight size={14} className="text-indigo-600"/> Open Full Report
                      </p>
                    </div>
                  </div>
                ))}
                {filteredPredictions.length === 0 && (
                  <div className="col-span-full py-32 text-center bg-white rounded-[5rem] border-dashed border-slate-200 border-2 shadow-inner">
                    <Microscope size={72} className="mx-auto text-slate-100 mb-8" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No analysis reports found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-[6rem] h-full flex flex-col items-center justify-center p-20 text-center space-y-12 animate-fade-in shadow-xl shadow-slate-200/50 mt-4">
            <div className="w-40 h-40 bg-indigo-50 border border-indigo-100 text-indigo-200 rounded-[4rem] flex items-center justify-center shadow-inner transition-transform hover:scale-105 duration-500">
               <User size={72} />
            </div>
            <div className="space-y-4">
               <h2 className="text-5xl font-black text-slate-900 tracking-tight">Select Patient</h2>
               <p className="text-slate-400 font-medium max-w-sm uppercase text-xs tracking-widest leading-loose">Choose a profile to view records and initiate automated AI scans.</p>
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-2xl animate-fade-in">
          <div className="bg-white rounded-[5rem] p-16 max-w-xl w-full shadow-2xl border border-white/20 space-y-12">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[3rem] mx-auto flex items-center justify-center shadow-inner border border-rose-100">
                <AlertCircle size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Confirm Deletion</h2>
              {!otpSent ? (
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest leading-relaxed">Permanent deletion for: <span className="text-slate-900 block mt-3 font-black text-3xl">{patientToDelete?.name}</span></p>
              ) : (
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest leading-relaxed">A safety code has been sent. <br/>Input the code to authorize disposal.</p>
              )}
            </div>

            {otpSent && (
              <input
                type="text"
                placeholder="000000"
                className="w-full text-center text-6xl font-black tracking-[0.4em] py-10 bg-slate-50 border-2 border-slate-100 rounded-[3.5rem] focus:outline-none focus:ring-8 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-indigo-600 shadow-inner"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            )}

            <div className="flex gap-6">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-7 bg-slate-100 text-slate-500 rounded-[3rem] font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95 shadow-sm border border-slate-200"
              >
                Abort
              </button>
              {otpSent && (
                <button 
                  onClick={confirmDelete}
                  disabled={verifying}
                  className="flex-1 py-7 bg-indigo-600 text-white rounded-[3rem] font-bold uppercase tracking-widest text-xs hover:bg-slate-900 shadow-2xl shadow-indigo-600/30 transition-all active:scale-95"
                >
                  {verifying ? "Checking..." : "Confirm Removal"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-2xl animate-fade-in shadow-2xl">
           <div className="bg-white rounded-[5rem] p-16 max-w-xl w-full shadow-2xl space-y-12">
              <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Edit Record</h2>
                 <button onClick={() => setShowEditModal(false)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-2xl"><X size={28} /></button>
              </div>
              <div className="space-y-8">
                 <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Full Legal Name</label>
                    <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] font-bold text-slate-900 shadow-inner text-lg focus:ring-4 focus:ring-indigo-50 transition-all"/>
                 </div>
                 <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Date of Birth</label>
                    <input type="date" value={editData.dob} onChange={e => setEditData({...editData, dob: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] font-bold text-slate-900 shadow-inner text-lg focus:ring-4 focus:ring-indigo-50 transition-all"/>
                 </div>
                 <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Archive Notes</label>
                    <textarea value={editData.notes} onChange={e => setEditData({...editData, notes: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] font-bold text-slate-800 shadow-inner h-40 focus:ring-4 focus:ring-indigo-50 transition-all"/>
                 </div>
                 <button onClick={submitEdit} className="w-full py-8 bg-indigo-600 text-white rounded-[3rem] font-black uppercase tracking-widest text-sm hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95">Update Profile</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}