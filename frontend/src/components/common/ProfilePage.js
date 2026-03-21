import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { token } = useContext(AuthContext);
const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    username: ""
  });

  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // ================= FETCH PROFILE =================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        email: data.email || "",
        username: data.username || "",
      });

      setLoading(false);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setLoading(false);
    }
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================= UPDATE PROFILE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("phone", form.phone);

      const res = await fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

     if (res.ok) {
  alert("✅ Profile updated successfully");

  // 🔥 GO BACK TO PREVIOUS PAGE
  navigate(-1);

} else {
  alert("❌ Failed to update profile");
}
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-lg">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">

      {/* TITLE */}
      <h2 className="text-2xl font-semibold mb-6 text-indigo-600">
        My Profile
      </h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* USERNAME (READ ONLY) */}
        <div>
          <label className="text-sm text-gray-500">Username</label>
          <input
            type="text"
            value={form.username}
            disabled
            className="w-full mt-1 p-3 border rounded-lg bg-gray-100"
          />
        </div>

        {/* EMAIL (READ ONLY) */}
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <input
            type="text"
            value={form.email}
            disabled
            className="w-full mt-1 p-3 border rounded-lg bg-gray-100"
          />
        </div>

        {/* FULL NAME */}
        <div>
          <label className="text-sm text-gray-500">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-lg"
            required
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="text-sm text-gray-500">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-lg"
            required
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Update Profile
        </button>

      </form>
    </div>
  );
}