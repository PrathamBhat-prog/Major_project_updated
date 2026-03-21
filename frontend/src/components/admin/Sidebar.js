import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  User,
  Image,
  MessageSquare
} from "lucide-react";

export default function Sidebar() {
  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Analytics", path: "/admin/analytics", icon: <BarChart3 size={18} /> },
    { name: "Doctors", path: "/admin/manage-doctors", icon: <Users size={18} /> },
    { name: "Patients", path: "/admin/patients", icon: <User size={18} /> },
    { name: "Predictions", path: "/admin/predictions", icon: <Image size={18} /> },
    { name: "Communication", path: "/admin/chat", icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="w-64 bg-white shadow-lg p-5">

      <h1 className="text-xl font-bold text-indigo-600 mb-8">
        CephAI Admin
      </h1>

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