import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";

export default function PatientRegistrationForm() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    appointment_date: new Date().toISOString().split('T')[0], // Default to today
    appointment_time: "09:00",
    reason: ""
  });

  // Fetch doctor info to confirm validity
  useEffect(() => {
    // In a real app, you'd verify the doctorId here
    setLoading(false);
  }, [doctorId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Combine date and time
      const dateTime = `${formData.appointment_date}T${formData.appointment_time}:00`;
      
      const payload = {
        patient_name: formData.patient_name,
        patient_email: formData.patient_email,
        patient_phone: formData.patient_phone,
        appointment_date: dateTime,
        reason: formData.reason
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/appointments/register/${doctorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to book appointment. Please try again.");
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0c10] overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>

        <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] text-center space-y-8 animate-in fade-in zoom-in duration-700 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-2 shadow-xl shadow-emerald-500/20 transform -rotate-6">
            <CheckCircle2 size={48} />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-white tracking-tight">Confirmed!</h2>
            <p className="text-slate-400 font-bold">Your visit is scheduled with CephaloAI.</p>
          </div>

          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 text-left">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                   <Calendar size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Date</p>
                   <p className="text-white font-bold">{new Date(formData.appointment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/20">
                   <Clock size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Time</p>
                   <p className="text-white font-bold">{formData.appointment_time}</p>
                </div>
             </div>
          </div>

          <p className="text-slate-500 text-sm font-medium leading-relaxed italic px-4">
            A confirmation email will be sent to <b>{formData.patient_email}</b> shortly.
          </p>

          <button 
            onClick={() => navigate("/")}
            className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
          >
            Return Home <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center bg-[#0a0c10]">
      <div className="max-w-2xl w-full">
        
        {/* Header Area */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            Clinical Intake Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">Book Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Consultation</span></h1>
          <p className="text-slate-500 font-bold max-w-md mx-auto">Please confirm your identity and preferred schedule to secure your appointment.</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">
          
          {/* Decorative background glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {error && (
              <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold animate-shake text-center">
                {error}
              </div>
            )}

            <div className="space-y-6">
               <h3 className="text-white font-black flex items-center gap-3 text-lg">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                   <User size={18} />
                 </div>
                 Personal Details
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text"
                    name="patient_name"
                    value={formData.patient_name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    required
                    type="tel"
                    name="patient_phone"
                    value={formData.patient_phone}
                    onChange={handleChange}
                    placeholder="+91 00000 00000"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  required
                  type="email"
                  name="patient_email"
                  value={formData.patient_email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-white font-black flex items-center gap-3 text-lg">
                 <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/20">
                   <Calendar size={18} />
                 </div>
                 Schedule Visit
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
                {/* Date */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Date</label>
                  <input 
                    required
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all [color-scheme:dark] font-bold"
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Time</label>
                  <input 
                    required
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all [color-scheme:dark] font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason for Visit (Optional)</label>
              <textarea 
                name="reason"
                rows="3"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Briefly describe your concerns..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none font-medium"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-black rounded-3xl hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg group"
            >
              {submitting ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Secure Appointment <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>

        <button 
          onClick={() => navigate("/")}
          className="mt-12 flex items-center gap-2 text-slate-600 hover:text-white font-black text-xs uppercase tracking-widest transition-all mx-auto bg-white/5 px-6 py-3 rounded-full border border-transparent hover:border-white/10"
        >
          <ArrowLeft size={14} /> Back to Homepage
        </button>
      </div>
    </div>
  );
}
