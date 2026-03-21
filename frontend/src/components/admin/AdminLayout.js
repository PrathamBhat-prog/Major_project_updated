import React from "react";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
}