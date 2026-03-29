import React from "react";
import Sidebar from "./Sidebar"; 
import DoctorHeader from "./DoctorHeader";

export default function DoctorLayout({ children }) {
  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      
      {/* Sidebar - Doctor Specific */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Dynamic Context Header */}
        <DoctorHeader />

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto w-full p-8 max-w-[1600px] mx-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}