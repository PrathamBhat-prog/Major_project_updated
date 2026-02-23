// filepath: src/components/common/Header.js

import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header(){
  const { currentUser, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/");
  };

  const handleProfileClick = () => {
    const confirmNav = window.confirm(
      "Are you sure you want to go to Dashboard?"
    );

    if (confirmNav) {
      nav("/doctor/dashboard");   // change path if needed
    }
  };

  return (
    <header className="bg-white/60 backdrop-blur sticky top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-indigo-600">
            CephaloAI
          </div>
          <div className="text-sm text-gray-600">
            Orthodontic Cephalogram Platform
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {currentUser && (
            <>
              {/* Profile Clickable */}
              <div
                onClick={handleProfileClick}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-indigo-600 transition"
              >
                <User size={18}/>
                <span>{currentUser.name}</span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                <LogOut size={16}/> Logout
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
}