import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import ThreeBackground from "../backgrounds/ThreeBackground";

export default function PublicLayout() {
  return (
    <div className="relative min-h-screen font-sans text-white overflow-hidden" style={{ backgroundColor: '#0a0a1a' }}>
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <ThreeBackground />
      </div>

      {/* Global Header for public routes */}
      <div className="relative z-30">
        <Header />
      </div>

      {/* Main Content Area */}
      <main className="relative z-30 w-full h-[calc(100vh-76px)] overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
