import React, { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  User,
  Image,
  MessageSquare
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar() {

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Analytics", path: "/admin/analytics", icon: <BarChart3 size={18} /> },
    { name: "Doctors", path: "/admin/manage-doctors", icon: <Users size={18} /> },
    { name: "Patients", path: "/admin/patients", icon: <User size={18} /> },
    { name: "Predictions", path: "/admin/predictions", icon: <Image size={18} /> },
    { name: "Communication", path: "/admin/chat", icon: <MessageSquare size={18} /> },
    {name: "Advanced Analysis", path: "/admin/advancedanalytics", icon: <BarChart3 size={18} /> }
  ];

  // ================= FETCH PROFILE =================
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
    <div className="w-64 bg-white shadow-lg p-5">

      {/* ================= PROFILE SECTION ================= */}
      <div className="mb-6 relative">

  {/* PROFILE CARD */}
  {profile && (
    <div
      onClick={() => setShowMenu(!showMenu)}
      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition border"
    >
      {/* AVATAR */}
      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
        {profile.full_name?.[0] || profile.username?.[0]}
      </div>

      {/* TEXT */}
      <div className="flex-1 overflow-hidden">
        <p className="font-semibold text-sm truncate">
          {profile.full_name || profile.username}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {profile.email}
        </p>
      </div>
    </div>
  )}

  {/* DROPDOWN */}
  {showMenu && (
    <div className="absolute left-0 top-full mt-2 w-full bg-white shadow-lg rounded-xl border z-50 overflow-hidden">

      <button
        onClick={() => navigate("/admin/profile")}
        className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm"
      >
        ✏️ Edit Profile
      </button>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm text-red-600"
      >
        🚪 Logout
      </button>

    </div>
  )}

</div>

      {/* ================= TITLE ================= */}
      <h1 className="text-xl font-bold text-indigo-600 mb-6">
        CephAI Admin
      </h1>

      {/* ================= MENU ================= */}
      <nav className="space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-indigo-100 text-indigo-600"
                  : "hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

    </div>
  );
}