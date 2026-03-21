import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function ProfileSetup() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    full_name: "",
    phone: ""
  });

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

      // If already completed → redirect
      if (data.is_profile_complete) {
        if (data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/doctor/dashboard");
        }
      }

      // Pre-fill (optional)
      setForm({
        full_name: data.full_name || "",
        phone: data.phone || ""
      });

    } catch (err) {
      console.error("Profile fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!form.full_name || !form.phone) {
      alert("Please fill all fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("phone", form.phone);

      const res = await fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        alert("Failed to update profile");
        return;
      }

      // 🔥 Fetch again to get role
      const profileRes = await fetch(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedProfile = await profileRes.json();

      // 🔥 Redirect based on role
      if (updatedProfile.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/doctor/dashboard");
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-[420px]">

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Complete Your Profile
        </h2>

        {/* FULL NAME */}
        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {/* PHONE */}
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
        >
          Save Profile
        </button>

      </div>
    </div>
  );
}